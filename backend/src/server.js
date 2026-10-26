import { createServer } from "node:http";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { loadEnvFile } from "node:process";
import { promisify } from "node:util";
import { GridFSBucket, MongoClient, ObjectId } from "mongodb";

try {
  loadEnvFile(new URL("../.env", import.meta.url));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

const port = Number(process.env.PORT ?? 4000);
const databaseName = process.env.MONGODB_DATABASE ?? "campushire";
const allowedOrigins = new Set(
  (process.env.FRONTEND_ORIGIN ?? "http://localhost:8080,http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("MONGODB_URI is missing. Set it in backend/.env before starting the backend.");
}

const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 10_000 });
try {
  await client.connect();
} catch (error) {
  const code = error && typeof error === "object" && "code" in error ? error.code : "unknown";
  const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.error(
    `Could not connect to MongoDB (error ${String(code)}). Check the standard URI in backend/.env, Atlas Network Access, and outbound TLS. ${detail}`,
  );
  await client.close().catch(() => undefined);
  process.exit(1);
}
const stateCollection = client.db(databaseName).collection("portal_state");
const accountsCollection = client.db(databaseName).collection("accounts");
const sessionsCollection = client.db(databaseName).collection("sessions");
const resumeBucket = new GridFSBucket(client.db(databaseName), { bucketName: "resumes" });
const scrypt = promisify(scryptCallback);
const demoPassword = process.env.DEMO_PASSWORD ?? "campushire";

const demoAccounts = [
  { email: "ananya.sharma@college.edu.in", role: "student", id: "s1", name: "Ananya Sharma" },
  { email: "nikhil@trinetrasystems.in", role: "recruiter", id: "r1", name: "Nikhil Menon" },
  { email: "placement.cell@college.edu.in", role: "admin", id: "p1", name: "Dr. S. Venkatesan" },
];

await sessionsCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
await accountsCollection.createIndex({ email: 1 }, { unique: true });
for (const account of demoAccounts) {
  const salt = randomBytes(16).toString("hex");
  const passwordHash = (await scrypt(demoPassword, salt, 64)).toString("hex");
  await accountsCollection.updateOne(
    { email: account.email, role: account.role },
    { $setOnInsert: { ...account, email: account.email.toLowerCase(), salt, passwordHash, createdAt: new Date() } },
    { upsert: true },
  );
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

async function issueSession(account, response, status = 200, extra = {}) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = { role: account.role, id: account.id, name: account.name };
  await sessionsCollection.insertOne({
    _id: hashToken(token),
    userId: account.id,
    role: account.role,
    name: account.name,
    email: account.email,
    createdAt: new Date(),
    expiresAt,
  });
  send(response, status, { token, session, ...extra });
}

async function getSession(request) {
  const authorization = request.headers.authorization ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return null;
  const session = await sessionsCollection.findOne({ _id: hashToken(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  return { role: session.role, id: session.userId, name: session.name };
}

function send(response, status, body) {
  response.writeHead(status, {
    "access-control-allow-methods": "GET, POST, PUT, OPTIONS",
    "access-control-allow-headers": "content-type, authorization",
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

async function readJson(request, maxBytes = 2_000_000) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > maxBytes) throw new Error("Request body is too large");
  }
  return JSON.parse(body);
}

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url ?? "/", `http://${request.headers.host}`).pathname;
  const origin = request.headers.origin;
  if (origin) {
    if (!allowedOrigins.has(origin)) {
      send(response, 403, { error: "Frontend origin is not allowed" });
      return;
    }
    response.setHeader("access-control-allow-origin", origin);
    response.setHeader("vary", "Origin");
  }

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "access-control-allow-methods": "GET, POST, PUT, OPTIONS",
      "access-control-allow-headers": "content-type, authorization",
    });
    response.end();
    return;
  }

  try {
    if (request.method === "GET" && pathname === "/health") {
      send(response, 200, { status: "ok" });
      return;
    }

    if (request.method === "GET" && pathname === "/api/state") {
      const document = await stateCollection.findOne({ _id: "main" });
      if (!document) {
        send(response, 200, null);
        return;
      }
      const { _id: _id, ...state } = document;
      send(response, 200, state);
      return;
    }

    if (request.method === "POST" && pathname === "/api/auth/login") {
      const credentials = await readJson(request);
      const email = typeof credentials.email === "string" ? credentials.email.trim().toLowerCase() : "";
      const password = typeof credentials.password === "string" ? credentials.password : "";
      const role = credentials.role;
      if (!email || !password || !["student", "recruiter", "admin"].includes(role)) {
        send(response, 400, { error: "Enter a valid email, password, and role" });
        return;
      }

      const account = await accountsCollection.findOne({ email, role });
      const submittedHash = account ? await scrypt(password, account.salt, 64) : Buffer.alloc(64);
      const expectedHash = account ? Buffer.from(account.passwordHash, "hex") : Buffer.alloc(64);
      if (!account || !timingSafeEqual(submittedHash, expectedHash)) {
        send(response, 401, { error: "Email or password is incorrect" });
        return;
      }

      await issueSession(account, response);
      return;
    }

    if (request.method === "POST" && pathname === "/api/auth/signup") {
      const input = await readJson(request);
      const role = input.role;
      const name = typeof input.name === "string" ? input.name.trim() : "";
      const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
      const password = typeof input.password === "string" ? input.password : "";
      if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        send(response, 400, { error: "Enter your name and a valid email address" });
        return;
      }
      if (password.length < 8 || password.length > 128) {
        send(response, 400, { error: "Password must be between 8 and 128 characters" });
        return;
      }
      if (role !== "student" && role !== "recruiter") {
        send(response, 400, { error: "Only student and recruiter accounts can sign up" });
        return;
      }

      const id = new ObjectId().toString();
      let profile;
      let account;
      if (role === "student") {
        const branches = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"];
        const branch = input.branch;
        const batch = Number(input.batch);
        const cgpa = Number(input.cgpa);
        const backlogs = Number(input.backlogs);
        if (
          !branches.includes(branch) ||
          ![2026, 2027].includes(batch) ||
          !Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10 ||
          !Number.isInteger(backlogs) || backlogs < 0
        ) {
          send(response, 400, { error: "Enter valid branch and academic details" });
          return;
        }
        profile = {
          id, name, email, branch, batch, cgpa, backlogs,
          phone: typeof input.phone === "string" ? input.phone.trim().slice(0, 30) : "",
          skills: [], resumeName: "", placed: false,
        };
        account = { id, name, email, role };
      } else {
        const company = typeof input.company === "string" ? input.company.trim() : "";
        if (!company || company.length > 120) {
          send(response, 400, { error: "Enter your company name" });
          return;
        }
        profile = { id, name, company, email, approved: false };
        account = { id, name, company, email, role };
      }

      const salt = randomBytes(16).toString("hex");
      const passwordHash = (await scrypt(password, salt, 64)).toString("hex");
      let insertedAccountId;
      try {
        const inserted = await accountsCollection.insertOne({ ...account, salt, passwordHash, createdAt: new Date() });
        insertedAccountId = inserted.insertedId;
      } catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === 11000) {
          send(response, 409, { error: "An account with this email already exists" });
          return;
        }
        throw error;
      }

      try {
        await stateCollection.updateOne(
          { _id: "main" },
          { $setOnInsert: { students: [], recruiters: [], drives: [], applications: [] } },
          { upsert: true },
        );
        await stateCollection.updateOne(
          { _id: "main" },
          role === "student" ? { $push: { students: profile } } : { $push: { recruiters: profile } },
        );
        await issueSession(account, response, 201);
      } catch (error) {
        if (insertedAccountId) await accountsCollection.deleteOne({ _id: insertedAccountId });
        throw error;
      }
      return;
    }

    if (request.method === "GET" && pathname === "/api/auth/session") {
      const session = await getSession(request);
      send(response, 200, session);
      return;
    }

    if (request.method === "POST" && pathname === "/api/resumes") {
      const session = await getSession(request);
      if (!session || session.role !== "student") {
        send(response, 401, { error: "A student session is required to upload a resume" });
        return;
      }
      const upload = await readJson(request, 7_500_000);
      if (
        upload.studentId !== session.id ||
        typeof upload.filename !== "string" ||
        !upload.filename.toLowerCase().endsWith(".pdf") ||
        typeof upload.data !== "string" ||
        !/^[A-Za-z0-9+/]*={0,2}$/.test(upload.data)
      ) {
        send(response, 400, { error: "Choose a valid PDF resume for your profile" });
        return;
      }

      const contents = Buffer.from(upload.data, "base64");
      if (contents.length === 0 || contents.length > 5_000_000 || contents.subarray(0, 5).toString() !== "%PDF-") {
        send(response, 400, { error: "Resume must be a PDF smaller than 5 MB" });
        return;
      }
      const stateDocument = await stateCollection.findOne({ _id: "main" });
      const student = stateDocument?.students?.find((entry) => entry.id === session.id);
      if (!student) {
        send(response, 404, { error: "Student profile not found" });
        return;
      }

      const uploadStream = resumeBucket.openUploadStream(upload.filename, {
        contentType: "application/pdf",
        metadata: { studentId: session.id },
      });
      uploadStream.end(contents);
      await new Promise((resolve, reject) => {
        uploadStream.once("finish", resolve);
        uploadStream.once("error", reject);
      });
      await stateCollection.updateOne(
        { _id: "main", "students.id": session.id },
        { $set: { "students.$.resumeName": upload.filename, "students.$.resumeFileId": uploadStream.id.toString() } },
      );
      if (student.resumeFileId && ObjectId.isValid(student.resumeFileId)) {
        await resumeBucket.delete(new ObjectId(student.resumeFileId)).catch(() => undefined);
      }
      send(response, 201, { filename: upload.filename, fileId: uploadStream.id.toString() });
      return;
    }

    const resumeDownload = pathname.match(/^\/api\/resumes\/([a-f\d]{24})$/i);
    if (request.method === "GET" && resumeDownload) {
      const session = await getSession(request);
      if (!session) {
        send(response, 401, { error: "Sign in to access resumes" });
        return;
      }
      const fileId = new ObjectId(resumeDownload[1]);
      const file = await resumeBucket.find({ _id: fileId }).next();
      if (!file) {
        send(response, 404, { error: "Resume not found" });
        return;
      }
      if (session.role === "student" && file.metadata?.studentId !== session.id) {
        send(response, 403, { error: "You can only access your own resume" });
        return;
      }
      response.writeHead(200, {
        "access-control-allow-origin": allowedOrigin,
        "content-type": "application/pdf",
        "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
      });
      resumeBucket.openDownloadStream(fileId).pipe(response);
      return;
    }

    if (request.method === "POST" && pathname === "/api/auth/logout") {
      const authorization = request.headers.authorization ?? "";
      const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
      if (token) await sessionsCollection.deleteOne({ _id: hashToken(token) });
      send(response, 200, { loggedOut: true });
      return;
    }

    if (request.method === "PUT" && pathname === "/api/state") {
      const state = await readJson(request);
      if (
        !state ||
        !Array.isArray(state.students) ||
        !Array.isArray(state.recruiters) ||
        !Array.isArray(state.drives) ||
        !Array.isArray(state.applications)
      ) {
        send(response, 400, { error: "Invalid portal state" });
        return;
      }

      const session = await getSession(request);
      const stateExists = await stateCollection.findOne({ _id: "main" }, { projection: { _id: 1 } });
      if (!session && stateExists) {
        send(response, 401, { error: "Sign in before changing portal data" });
        return;
      }

      await stateCollection.updateOne(
        { _id: "main" },
        { $set: { students: state.students, recruiters: state.recruiters, drives: state.drives, applications: state.applications } },
        { upsert: true },
      );
      for (const student of state.students) {
        await accountsCollection.updateOne(
          { role: "student", id: student.id },
          { $set: { email: student.email.toLowerCase(), name: student.name } },
        );
        await sessionsCollection.updateMany(
          { role: "student", userId: student.id },
          { $set: { email: student.email.toLowerCase(), name: student.name } },
        );
      }
      for (const recruiter of state.recruiters) {
        await accountsCollection.updateOne(
          { role: "recruiter", id: recruiter.id },
          { $set: { email: recruiter.email.toLowerCase(), name: recruiter.name } },
        );
        await sessionsCollection.updateMany(
          { role: "recruiter", userId: recruiter.id },
          { $set: { email: recruiter.email.toLowerCase(), name: recruiter.name } },
        );
      }
      send(response, 200, { saved: true });
      return;
    }

    send(response, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    send(response, 500, { error: "Backend request failed" });
  }
});

server.listen(port, () => {
  console.log(`CampusHire backend listening at http://localhost:${port}`);
});

async function shutdown() {
  server.close();
  await client.close();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
