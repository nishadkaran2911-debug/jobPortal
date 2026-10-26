import { useSyncExternalStore } from "react";
import {
  loadPortalState,
  restoreSession,
  savePortalState,
  signIn,
  signOut,
  signUp,
  type SignupInput,
} from "./api";

export type Branch = "CSE" | "IT" | "ECE" | "EEE" | "MECH" | "CIVIL";
export type Role = "student" | "recruiter" | "admin";
export type DriveStatus = "pending" | "approved" | "rejected" | "closed";
export type AppStatus =
  | "applied"
  | "shortlisted"
  | "interview"
  | "selected"
  | "rejected";

export interface Student {
  id: string;
  name: string;
  email: string;
  branch: Branch;
  batch: number;
  cgpa: number;
  backlogs: number;
  phone: string;
  skills: string[];
  resumeName: string;
  resumeFileId?: string;
  placed: boolean;
}

export interface Drive {
  id: string;
  company: string;
  recruiterId: string;
  logoTone: string;
  role: string;
  location: string;
  type: "Full-time" | "Internship" | "Intern + FTE";
  ctcMin: number;
  ctcMax: number;
  stipend?: string | undefined;
  description: string;
  rounds: string[];
  openings: number;
  deadline: string;
  driveDate: string;
  status: DriveStatus;
  minCgpa: number;
  branches: Branch[];
  batches: number[];
  maxBacklogs: number;
  skills: string[];
}

export interface Application {
  id: string;
  driveId: string;
  studentId: string;
  appliedOn: string;
  status: AppStatus;
  note?: string | undefined;
}

export interface Recruiter {
  id: string;
  name: string;
  company: string;
  email: string;
  approved: boolean;
}

export interface Session {
  role: Role;
  id: string;
  name: string;
}

const students: Student[] = [
  {
    id: "s1",
    name: "Ananya Sharma",
    email: "ananya.sharma@college.edu.in",
    branch: "CSE",
    batch: 2026,
    cgpa: 8.6,
    backlogs: 0,
    phone: "+91 98220 41123",
    skills: ["React", "TypeScript", "Node.js", "SQL", "AWS"],
    resumeName: "Ananya_Sharma_Resume.pdf",
    placed: false,
  },
  {
    id: "s2",
    name: "Rohit Deshmukh",
    email: "rohit.deshmukh@college.edu.in",
    branch: "IT",
    batch: 2026,
    cgpa: 7.2,
    backlogs: 1,
    phone: "+91 90045 77210",
    skills: ["Java", "Spring Boot", "MySQL"],
    resumeName: "Rohit_Deshmukh_Resume.pdf",
    placed: false,
  },
  {
    id: "s3",
    name: "Meera Iyer",
    email: "meera.iyer@college.edu.in",
    branch: "ECE",
    batch: 2026,
    cgpa: 9.1,
    backlogs: 0,
    phone: "+91 96321 88014",
    skills: ["Embedded C", "VLSI", "Python"],
    resumeName: "Meera_Iyer_Resume.pdf",
    placed: true,
  },
  {
    id: "s4",
    name: "Karthik Reddy",
    email: "karthik.reddy@college.edu.in",
    branch: "CSE",
    batch: 2027,
    cgpa: 6.8,
    backlogs: 2,
    phone: "+91 93910 22458",
    skills: ["Python", "Django"],
    resumeName: "Karthik_Reddy_Resume.pdf",
    placed: false,
  },
  {
    id: "s5",
    name: "Priya Nair",
    email: "priya.nair@college.edu.in",
    branch: "IT",
    batch: 2026,
    cgpa: 8.0,
    backlogs: 0,
    phone: "+91 99870 31145",
    skills: ["React Native", "Firebase", "UI Design"],
    resumeName: "Priya_Nair_Resume.pdf",
    placed: false,
  },
  {
    id: "s6",
    name: "Aditya Kulkarni",
    email: "aditya.kulkarni@college.edu.in",
    branch: "MECH",
    batch: 2026,
    cgpa: 7.9,
    backlogs: 0,
    phone: "+91 88061 90233",
    skills: ["SolidWorks", "ANSYS", "Manufacturing"],
    resumeName: "Aditya_Kulkarni_Resume.pdf",
    placed: false,
  },
];

const recruiters: Recruiter[] = [
  {
    id: "r1",
    name: "Nikhil Menon",
    company: "Trinetra Systems",
    email: "nikhil@trinetrasystems.in",
    approved: true,
  },
  {
    id: "r2",
    name: "Shreya Bansal",
    company: "Vayu Analytics",
    email: "shreya@vayuanalytics.com",
    approved: true,
  },
  {
    id: "r3",
    name: "Arjun Pillai",
    company: "Kavach Fintech",
    email: "arjun@kavachfin.in",
    approved: false,
  },
];

const drives: Drive[] = [
  {
    id: "d1",
    company: "Trinetra Systems",
    recruiterId: "r1",
    logoTone: "TS",
    role: "Software Engineer I",
    location: "Bangalore",
    type: "Full-time",
    ctcMin: 9,
    ctcMax: 12,
    description:
      "Join the platform engineering team building high-throughput services for India's largest logistics networks. You will work across backend APIs, data pipelines and internal tooling.",
    rounds: [
      "Online assessment (90 min)",
      "Technical interview I",
      "Technical interview II",
      "HR discussion",
    ],
    openings: 12,
    deadline: "2026-10-12",
    driveDate: "2026-10-24",
    status: "approved",
    minCgpa: 7.5,
    branches: ["CSE", "IT", "ECE"],
    batches: [2026],
    maxBacklogs: 0,
    skills: ["Java", "Data Structures", "SQL"],
  },
  {
    id: "d2",
    company: "Vayu Analytics",
    recruiterId: "r2",
    logoTone: "VA",
    role: "Data Analyst",
    location: "Hyderabad",
    type: "Full-time",
    ctcMin: 6,
    ctcMax: 8,
    description:
      "Work with product and growth teams to turn raw event data into decisions. Strong SQL and a structured mind matter more than prior experience.",
    rounds: ["Aptitude + SQL test", "Case study round", "Managerial round"],
    openings: 8,
    deadline: "2026-10-05",
    driveDate: "2026-10-18",
    status: "approved",
    minCgpa: 7.0,
    branches: ["CSE", "IT", "ECE", "EEE"],
    batches: [2026],
    maxBacklogs: 1,
    skills: ["SQL", "Excel", "Python"],
  },
  {
    id: "d3",
    company: "Kavach Fintech",
    recruiterId: "r3",
    logoTone: "KF",
    role: "Backend Developer",
    location: "Pune",
    type: "Intern + FTE",
    ctcMin: 7,
    ctcMax: 10,
    stipend: "₹35,000 / month during internship",
    description:
      "Six month internship converting to a full-time role. You will build payment reconciliation services used by 200+ lending partners.",
    rounds: ["Coding round", "System design discussion", "Founder round"],
    openings: 6,
    deadline: "2026-10-20",
    driveDate: "2026-11-02",
    status: "pending",
    minCgpa: 7.0,
    branches: ["CSE", "IT"],
    batches: [2026, 2027],
    maxBacklogs: 0,
    skills: ["Node.js", "PostgreSQL", "REST APIs"],
  },
  {
    id: "d4",
    company: "Sahyadri Motors",
    recruiterId: "r1",
    logoTone: "SM",
    role: "Design Engineer (Trainee)",
    location: "Chennai",
    type: "Full-time",
    ctcMin: 6,
    ctcMax: 7,
    description:
      "Graduate engineer trainee programme in the EV powertrain division. Rotational across CAD, simulation and validation.",
    rounds: ["Technical screening", "Panel interview", "HR round"],
    openings: 15,
    deadline: "2026-10-15",
    driveDate: "2026-10-28",
    status: "approved",
    minCgpa: 7.0,
    branches: ["MECH", "EEE", "CIVIL"],
    batches: [2026],
    maxBacklogs: 1,
    skills: ["SolidWorks", "ANSYS"],
  },
  {
    id: "d5",
    company: "Indus Cloud Labs",
    recruiterId: "r2",
    logoTone: "IC",
    role: "Frontend Engineer",
    location: "Remote (India)",
    type: "Full-time",
    ctcMin: 8,
    ctcMax: 11,
    description:
      "Build the customer-facing console for a developer platform used by 40,000 engineers. Heavy focus on React, accessibility and performance.",
    rounds: ["Take-home assignment", "Pairing round", "Culture round"],
    openings: 5,
    deadline: "2026-10-09",
    driveDate: "2026-10-21",
    status: "approved",
    minCgpa: 8.0,
    branches: ["CSE", "IT"],
    batches: [2026],
    maxBacklogs: 0,
    skills: ["React", "TypeScript", "CSS"],
  },
  {
    id: "d6",
    company: "Agni Semiconductors",
    recruiterId: "r1",
    logoTone: "AS",
    role: "VLSI Design Intern",
    location: "Bangalore",
    type: "Internship",
    ctcMin: 0,
    ctcMax: 0,
    stipend: "₹40,000 / month, 6 months",
    description:
      "Hands-on RTL design and verification internship with the SoC team. Strong digital electronics fundamentals expected.",
    rounds: ["Technical MCQ", "RTL interview", "HR round"],
    openings: 4,
    deadline: "2026-10-30",
    driveDate: "2026-11-08",
    status: "approved",
    minCgpa: 8.5,
    branches: ["ECE", "EEE"],
    batches: [2026, 2027],
    maxBacklogs: 0,
    skills: ["Verilog", "Digital Design"],
  },
];

const applications: Application[] = [
  {
    id: "a1",
    driveId: "d2",
    studentId: "s1",
    appliedOn: "2026-09-18",
    status: "shortlisted",
  },
  {
    id: "a2",
    driveId: "d1",
    studentId: "s3",
    appliedOn: "2026-09-16",
    status: "selected",
    note: "Offer rolled out — 11.5 LPA",
  },
  {
    id: "a3",
    driveId: "d1",
    studentId: "s5",
    appliedOn: "2026-09-20",
    status: "applied",
  },
  {
    id: "a4",
    driveId: "d5",
    studentId: "s1",
    appliedOn: "2026-09-22",
    status: "interview",
  },
  {
    id: "a5",
    driveId: "d4",
    studentId: "s6",
    appliedOn: "2026-09-19",
    status: "applied",
  },
  {
    id: "a6",
    driveId: "d2",
    studentId: "s2",
    appliedOn: "2026-09-21",
    status: "rejected",
    note: "Did not clear SQL test",
  },
];

export interface State {
  session: Session | null;
  students: Student[];
  recruiters: Recruiter[];
  drives: Drive[];
  applications: Application[];
}

const STORAGE_KEY = "campushire-state-v1";

let state: State = {
  session: null,
  students,
  recruiters,
  drives,
  applications,
};

if (typeof window !== "undefined") {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) state = { ...state, ...JSON.parse(saved), session: null };
  } catch {
    // corrupted saved state — fall back to the sample data
  }
}

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function saveLocalState(next: State) {
  if (typeof window === "undefined") return;
  try {
    const { session: _session, ...persisted } = next;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // Keep the in-memory state when local storage is unavailable.
  }
}

export function setState(update: (s: State) => State) {
  state = update(state);
  if (typeof window !== "undefined") {
    try {
      const { session: _session, ...persisted } = state;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // storage full or unavailable — the session just won't persist
    }
  }
  void savePortalState(state).catch((error: unknown) => {
    console.error("Could not save portal data to MongoDB:", error);
  });
  emit();
}

// Reconcile browser session state with the shared MongoDB data after startup.
// Seed MongoDB from the bundled demo records only when the database is empty.
if (typeof window !== "undefined") {
  void loadPortalState()
    .then((saved) => {
      if (saved) {
        state = { ...state, ...saved, session: state.session };
        emit();
        return undefined;
      } else {
        return savePortalState(state);
      }
    })
    .catch((error: unknown) => {
      console.error("Could not load portal data from MongoDB:", error);
    });

  void restoreSession()
    .then((session) => {
      state = { ...state, session };
      emit();
    })
    .catch((error: unknown) => {
      console.error("Could not restore sign-in session:", error);
    });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

export function getState() {
  return state;
}

export const DEMO_ACCOUNTS: Record<Role, { label: string; email: string; session: Session }> = {
  student: {
    label: "Student",
    email: "ananya.sharma@college.edu.in",
    session: { role: "student", id: "s1", name: "Ananya Sharma" },
  },
  recruiter: {
    label: "Recruiter",
    email: "nikhil@trinetrasystems.in",
    session: { role: "recruiter", id: "r1", name: "Nikhil Menon" },
  },
  admin: {
    label: "Placement Officer",
    email: "placement.cell@college.edu.in",
    session: { role: "admin", id: "p1", name: "Dr. S. Venkatesan" },
  },
};

export async function login(email: string, password: string, role: Role) {
  return signIn(email, password, role);
}

export async function registerAccount(input: SignupInput) {
  const session = await signUp(input);
  const saved = await loadPortalState();
  if (saved) {
    state = { ...state, ...saved, session: state.session };
    emit();
  }
  return session;
}

export function setSession(session: Session | null) {
  state = { ...state, session };
  emit();
}

export async function logout() {
  state = { ...state, session: null };
  emit();
  await signOut();
}

export function applyToDrive(driveId: string, studentId: string) {
  setState((s) => ({
    ...s,
    applications: [
      ...s.applications,
      {
        id: `a${Date.now()}`,
        driveId,
        studentId,
        appliedOn: new Date().toISOString().slice(0, 10),
        status: "applied",
      },
    ],
  }));
}

export function updateApplication(id: string, status: AppStatus, note?: string) {
  setState((s) => ({
    ...s,
    applications: s.applications.map((a) =>
      a.id === id ? { ...a, status, note: note ?? a.note } : a,
    ),
  }));
}

export function setDriveStatus(id: string, status: DriveStatus) {
  setState((s) => ({
    ...s,
    drives: s.drives.map((d) => (d.id === id ? { ...d, status } : d)),
  }));
}

export async function addDrive(drive: Omit<Drive, "id" | "status" | "logoTone">) {
  const id = `d${Date.now()}`;
  const previous = state;
  const next: State = {
    ...state,
    drives: [
      {
        ...drive,
        id,
        status: "pending",
        logoTone: drive.company.slice(0, 2).toUpperCase(),
      },
      ...state.drives,
    ],
  };
  state = next;
  saveLocalState(next);
  emit();
  try {
    await savePortalState(next);
  } catch (error) {
    state = previous;
    saveLocalState(previous);
    emit();
    throw error;
  }
  return id;
}

export function updateStudent(id: string, patch: Partial<Student>) {
  setState((s) => ({
    ...s,
    students: s.students.map((st) => (st.id === id ? { ...st, ...patch } : st)),
  }));
}

export function setRecruiterApproved(id: string, approved: boolean) {
  setState((s) => ({
    ...s,
    recruiters: s.recruiters.map((r) => (r.id === id ? { ...r, approved } : r)),
  }));
}

/* ---------- eligibility ---------- */

export interface Criterion {
  label: string;
  ok: boolean;
  detail: string;
}

export function checkEligibility(drive: Drive, student: Student) {
  const criteria: Criterion[] = [
    {
      label: "CGPA requirement",
      ok: student.cgpa >= drive.minCgpa,
      detail: `Requires ${drive.minCgpa.toFixed(1)} — your CGPA is ${student.cgpa.toFixed(1)}`,
    },
    {
      label: "Branch eligibility",
      ok: drive.branches.includes(student.branch),
      detail: `Open to ${drive.branches.join(", ")} — you are in ${student.branch}`,
    },
    {
      label: "Batch eligibility",
      ok: drive.batches.includes(student.batch),
      detail: `Open to batch ${drive.batches.join(" / ")} — you are batch ${student.batch}`,
    },
    {
      label: "Backlog policy",
      ok: student.backlogs <= drive.maxBacklogs,
      detail:
        drive.maxBacklogs === 0
          ? `No active backlogs allowed — you have ${student.backlogs}`
          : `Up to ${drive.maxBacklogs} backlog(s) allowed — you have ${student.backlogs}`,
    },
  ];
  return { criteria, eligible: criteria.every((c) => c.ok) };
}

export function getResumeMatch(drive: Drive, student: Student) {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#.]/g, "");
  const studentSkills = new Set(student.skills.map(normalize));
  const matched = drive.skills.filter((skill) => studentSkills.has(normalize(skill)));
  const missing = drive.skills.filter((skill) => !studentSkills.has(normalize(skill)));
  const skillScore = drive.skills.length ? (matched.length / drive.skills.length) * 70 : 70;
  const academicScore = Math.min(Math.max(student.cgpa - drive.minCgpa, 0) * 10, 20);
  const resumeScore = student.resumeName ? 10 : 0;
  const score = Math.round(skillScore + academicScore + resumeScore);
  const suggestions = [
    missing.length
      ? `Add evidence for ${missing.slice(0, 3).join(", ")} in projects, coursework or internships.`
      : "Your listed skills cover the role requirements. Add project impact metrics to stand out.",
    `Keep a role-specific summary for ${drive.role} and mention ${drive.company} keywords naturally.`,
    student.resumeName
      ? "Use the latest resume before applying so recruiters see current projects."
      : "Upload a resume before applying to improve recruiter confidence.",
  ];

  return {
    score,
    matched,
    missing,
    strength: score >= 80 ? "Strong match" : score >= 55 ? "Good match" : "Needs work",
    suggestions,
  };
}

export function formatCtc(d: Drive) {
  if (d.ctcMax === 0) return d.stipend ?? "Stipend based";
  if (d.ctcMin === d.ctcMax) return `₹${d.ctcMax} LPA`;
  return `₹${d.ctcMin}–${d.ctcMax} LPA`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysLeft(iso: string) {
  const ms = new Date(iso).getTime() - new Date("2026-09-28").getTime();
  return Math.ceil(ms / 86400000);
}
