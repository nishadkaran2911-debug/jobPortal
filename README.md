# CampusHire

The project is split into two apps:

- `frontend/` — TanStack Start and React user interface.
- `backend/` — Node.js HTTP API and MongoDB persistence.

## Run locally

1. Install Node.js 22 or newer.
2. Create a MongoDB database (MongoDB Atlas or a local MongoDB server).
3. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` to your connection string.
4. Install each app's dependencies from the project root:

   ```sh
   npm run install:frontend
   npm run install:backend
   ```

5. Start the backend and frontend in separate terminals, both from the project root:

   ```sh
   npm run dev:backend
   ```

   ```sh
   npm run dev:frontend
   ```

6. Open the frontend URL Vite prints (usually `http://localhost:8080`). The backend listens on `http://localhost:4000`; `http://localhost:4000/health` reports whether it is running.

On first load, existing demo records are saved to the MongoDB `campushire.portal_state` document. Demo accounts are seeded into the `accounts` collection with scrypt-hashed passwords; login sessions are stored in `sessions` and expire after seven days. The demo password is `campushire` (override it before the first backend start with `DEMO_PASSWORD`). Existing demo accounts retain their original password hash on later starts.

Student and recruiter sign-up is enabled from the login page. Students create a profile with their branch and academic details; new recruiter accounts start pending Placement Cell approval. Officer accounts remain administrator-managed. Every portal data change is sent to the backend and saved in MongoDB. Uploaded PDF resumes are stored in MongoDB GridFS, with the file ID linked to the student profile. The browser stores only the opaque session token; the actual account and session records live in MongoDB. Add password reset and stricter role-specific authorization before production use.

For a deployed frontend, set `VITE_API_URL` to the backend's public URL and set `FRONTEND_ORIGIN` in the backend environment to the frontend's origin.
