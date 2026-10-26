import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Brand } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEMO_ACCOUNTS, login, registerAccount, setSession, type Branch, type Role } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — CampusHire" },
      {
        name: "description",
        content:
          "Sign in to CampusHire as a student, recruiter or placement officer to manage campus placement drives.",
      },
      { property: "og:title", content: "Sign in — CampusHire" },
      {
        property: "og:description",
        content: "Access campus placement drives, applications and approvals.",
      },
    ],
  }),
  component: LoginPage,
});

const HOME: Record<Role, string> = {
  student: "/student",
  recruiter: "/recruiter",
  admin: "/admin",
};

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState(DEMO_ACCOUNTS.student.email);
  const [password, setPassword] = useState("campushire");
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [branch, setBranch] = useState<Branch>("CSE");
  const [batch, setBatch] = useState("2027");
  const [cgpa, setCgpa] = useState("7.0");
  const [backlogs, setBacklogs] = useState("0");
  const [phone, setPhone] = useState("");

  const onRole = (r: Role) => {
    setRole(r);
    if (mode === "login") setEmail(DEMO_ACCOUNTS[r].email);
  };

  const changeMode = (next: "login" | "signup") => {
    setMode(next);
    if (next === "signup") {
      if (role === "admin") setRole("student");
      setName("");
      setCompany("");
      setEmail("");
      setPassword("");
    } else {
      setEmail(DEMO_ACCOUNTS[role === "admin" ? "admin" : role].email);
      setPassword("campushire");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && role === "admin") {
      toast.error("Placement Officer accounts are managed by the administrator.");
      return;
    }
    if (!email.trim() || !password.trim()) {
      toast.error("Enter your email and password to continue.");
      return;
    }
    setSubmitting(true);
    try {
      let session;
      if (mode === "login") {
        session = await login(email, password, role);
      } else if (role === "student") {
        session = await registerAccount({
          role,
          name,
          email,
          password,
          branch,
          batch: Number(batch),
          cgpa: Number(cgpa),
          backlogs: Number(backlogs),
          phone,
        });
      } else if (role === "recruiter") {
        session = await registerAccount({ role, name, email, password, company });
      } else {
        throw new Error("Placement Officer accounts are managed by the administrator.");
      }
      setSession(session);
      toast.success(`Signed in as ${session.name}`);
      navigate({ to: HOME[role] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.8fr)]">
      <aside className="login-aside hidden flex-col justify-between border-r border-border bg-primary p-10 text-primary-foreground lg:flex xl:p-14" style={{ background: "oklch(0.18 0.04 250)" }}>
        <Brand className="text-primary-foreground" />
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary-foreground/60">
            Campus placements · 2026–27
          </p>
          <h2
            className="mt-5 max-w-sm leading-tight text-primary-foreground"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 400, letterSpacing: "-0.02em" }}
          >
            A shared view of placement season.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/70">
            Students see verified drives and their eligibility. Recruiters run their hiring.
            The placement cell keeps oversight of everything.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/40">
          Training &amp; Placement Cell · Demo environment
        </p>
      </aside>

      <main className="login-main flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden">
            <Brand />
          </Link>
          <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-primary lg:mt-0">Secure portal access</p>
          <h1 className="mt-2 text-2xl font-semibold">{mode === "login" ? "Sign in" : "Create your account"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login" ? "Choose your role and continue to the portal." : "Join CampusHire to manage placements and applications."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1">
            {(["login", "signup"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => changeMode(option)}
                className={mode === option ? "rounded-md bg-background px-3 py-2 text-sm font-medium shadow-sm" : "rounded-md px-3 py-2 text-sm text-muted-foreground"}
              >
                {option === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <Tabs value={role} onValueChange={(v) => onRole(v as Role)} className="mt-4">
            <TabsList className={`grid w-full ${mode === "signup" ? "grid-cols-2" : "grid-cols-3"}`}>
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="recruiter">Recruiter</TabsTrigger>
              {mode === "login" ? <TabsTrigger value="admin">Officer</TabsTrigger> : null}
            </TabsList>
          </Tabs>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" ? (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required autoComplete="name" />
              </div>
            ) : null}
            {mode === "signup" && role === "recruiter" ? (
              <div className="space-y-1.5">
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} maxLength={120} required autoComplete="organization" />
              </div>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            {mode === "signup" && role === "student" ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="branch">Branch</Label>
                  <select id="branch" value={branch} onChange={(e) => setBranch(e.target.value as Branch)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {(["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"] as Branch[]).map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="batch">Graduation batch</Label>
                  <select id="batch" value={batch} onChange={(e) => setBatch(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="2026">2026</option><option value="2027">2027</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cgpa">CGPA</Label>
                  <Input id="cgpa" type="number" min="0" max="10" step="0.01" value={cgpa} onChange={(e) => setCgpa(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="backlogs">Active backlogs</Label>
                  <Input id="backlogs" type="number" min="0" step="1" value={backlogs} onChange={(e) => setBacklogs(e.target.value)} required />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} autoComplete="tel" />
                </div>
              </div>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={mode === "signup" ? 8 : undefined}
                maxLength={128}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Please wait…" : mode === "login" ? `Continue as ${DEMO_ACCOUNTS[role].label.toLowerCase()}` : `Create ${role} account`}
            </Button>
          </form>

          <p className="mt-6 rounded-lg border-l-2 border-primary bg-secondary px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            {mode === "login"
              ? <><strong className="font-semibold text-foreground">Demo:</strong> Accounts are pre-filled. Password is <strong className="font-semibold text-foreground">campushire</strong>. Sessions checked by backend and stored in MongoDB.</>
              : role === "recruiter"
                ? "New recruiter accounts are created as pending and must be approved by the Placement Cell."
                : "Use a password with at least 8 characters. Your student profile is saved to the database."}
          </p>
        </div>
      </main>
    </div>
  );
}
