import type { State } from "./store";

const API_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:4000";
const TOKEN_KEY = "campushire-auth-token";

export type SignupInput =
  | {
      role: "student";
      name: string;
      email: string;
      password: string;
      branch: "CSE" | "IT" | "ECE" | "EEE" | "MECH" | "CIVIL";
      batch: number;
      cgpa: number;
      backlogs: number;
      phone: string;
    }
  | {
      role: "recruiter";
      name: string;
      email: string;
      password: string;
      company: string;
    };

function getToken() {
  return typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getToken();
  return token ? { authorization: `Bearer ${token}` } : {};
}

export async function signIn(email: string, password: string, role: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });
  const result = (await response.json()) as {
    error?: string;
    token?: string;
    session?: State["session"];
  };
  if (!response.ok || !result.token || !result.session) {
    throw new Error(result.error ?? "Sign in failed");
  }
  window.localStorage.setItem(TOKEN_KEY, result.token);
  return result.session;
}

export async function signUp(input: SignupInput) {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const result = (await response.json()) as {
    error?: string;
    token?: string;
    session?: State["session"];
  };
  if (!response.ok || !result.token || !result.session) {
    throw new Error(result.error ?? "Account creation failed");
  }
  window.localStorage.setItem(TOKEN_KEY, result.token);
  return result.session;
}

export async function restoreSession(): Promise<State["session"]> {
  if (!getToken()) return null;
  const response = await fetch(`${API_URL}/api/auth/session`, { headers: authHeaders() });
  if (!response.ok) throw new Error(`Backend returned ${response.status}`);
  const session = (await response.json()) as State["session"];
  if (!session) window.localStorage.removeItem(TOKEN_KEY);
  return session;
}

export async function signOut(): Promise<void> {
  const token = getToken();
  try {
    if (token) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: authHeaders(),
      });
    }
  } finally {
    if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
  }
}

export async function loadPortalState(): Promise<Partial<State> | null> {
  const response = await fetch(`${API_URL}/api/state`);
  if (!response.ok) throw new Error(`Backend returned ${response.status}`);
  return (await response.json()) as Partial<State> | null;
}

export async function savePortalState(state: State): Promise<void> {
  const { session: _session, ...data } = state;
  const response = await fetch(`${API_URL}/api/state`, {
    method: "PUT",
    headers: { "content-type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(result?.error ?? `Backend returned ${response.status}`);
  }
}

export async function uploadResume(studentId: string, file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  const response = await fetch(`${API_URL}/api/resumes`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders() },
    body: JSON.stringify({ studentId, filename: file.name, data: btoa(binary) }),
  });
  const result = (await response.json()) as { error?: string; filename?: string; fileId?: string };
  if (!response.ok || !result.fileId || !result.filename) {
    throw new Error(result.error ?? "Resume upload failed");
  }
  return { filename: result.filename, fileId: result.fileId };
}
