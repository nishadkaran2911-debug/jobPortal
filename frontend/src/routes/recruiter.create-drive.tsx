import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader, Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addDrive, useStore, type Branch, type Drive } from "@/lib/store";

export const Route = createFileRoute("/recruiter/create-drive")({
  head: () => ({
    meta: [
      { title: "Create Placement Drive — CampusHire" },
      { name: "description", content: "Post a new campus placement drive for Placement Cell approval." },
      { property: "og:title", content: "Create Placement Drive — CampusHire" },
      { property: "og:description", content: "Submit a new campus drive to the Placement Cell." },
    ],
  }),
  component: CreateDrive,
});

const BRANCHES: Branch[] = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"];
const TYPES: Drive["type"][] = ["Full-time", "Internship", "Intern + FTE"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="form-section surface p-6">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "form-field sm:col-span-2" : "form-field"}>
      <Label className="mb-1.5 block text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function CreateDrive() {
  const session = useStore((s) => s.session);
  const recruiter = useStore((s) => s.recruiters.find((r) => r.id === s.session?.id));
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [f, setF] = useState({
    role: "",
    location: "",
    type: "Full-time" as Drive["type"],
    ctcMin: "6",
    ctcMax: "10",
    stipend: "",
    openings: "5",
    deadline: "",
    driveDate: "",
    description: "",
    rounds: "Online assessment\nTechnical interview\nHR round",
    minCgpa: "7.0",
    maxBacklogs: "0",
    skills: "",
  });
  const [branches, setBranches] = useState<Branch[]>(["CSE", "IT"]);
  const [batches, setBatches] = useState<number[]>([2026]);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (session?.role !== "recruiter") {
      setSubmitError("Sign in with a recruiter account to submit a placement drive.");
      return;
    }
    if (!recruiter) {
      setSubmitError("Your recruiter profile is still loading. Refresh the page and try again.");
      return;
    }
    if (!f.role || !f.location || !f.deadline || !f.driveDate || !branches.length || !batches.length) {
      setSubmitError("Please fill role, location, dates, branches and batches.");
      toast.error("Please fill role, location, dates, branches and batches.");
      return;
    }
    setSubmitting(true);
    try {
      await addDrive({
        company: recruiter?.company ?? "Company",
        recruiterId: session?.id ?? "",
        role: f.role,
        location: f.location,
        type: f.type,
        ctcMin: Number(f.ctcMin),
        ctcMax: Number(f.ctcMax),
        stipend: f.stipend || undefined,
        description: f.description,
        rounds: f.rounds.split("\n").map((r) => r.trim()).filter(Boolean),
        openings: Number(f.openings),
        deadline: f.deadline,
        driveDate: f.driveDate,
        minCgpa: Number(f.minCgpa),
        branches,
        batches,
        maxBacklogs: Number(f.maxBacklogs),
        skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      toast.success("Drive submitted to the Placement Cell for approval");
      navigate({ to: "/recruiter" });
    } catch (error) {
      const message = error instanceof Error ? `Could not save drive: ${error.message}` : "Could not save drive. Please try again.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell>
      <PageHeader
        title="Create placement drive"
        description={`Posting as ${recruiter?.company ?? "your company"}. Drives go live once the Placement Cell approves them.`}
      />
      <form onSubmit={submit} className="drive-form mx-auto max-w-3xl space-y-6">
        {submitError ? (
          <p role="alert" className="rounded-md border border-destructive/30 bg-danger-soft px-4 py-3 text-sm text-destructive">
            {submitError}
          </p>
        ) : null}
        <Section title="Role details">
          <Field label="Job role"><Input required value={f.role} onChange={set("role")} placeholder="Software Engineer I" /></Field>
          <Field label="Location"><Input required value={f.location} onChange={set("location")} placeholder="Bangalore" /></Field>
          <Field label="Employment type">
            <select value={f.type} onChange={set("type")} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Openings"><Input type="number" value={f.openings} onChange={set("openings")} /></Field>
          <Field label="CTC min (LPA)"><Input type="number" value={f.ctcMin} onChange={set("ctcMin")} /></Field>
          <Field label="CTC max (LPA)"><Input type="number" value={f.ctcMax} onChange={set("ctcMax")} /></Field>
          <Field label="Stipend (optional)" wide><Input value={f.stipend} onChange={set("stipend")} placeholder="₹30,000 / month" /></Field>
          <Field label="Description" wide><Textarea rows={4} value={f.description} onChange={set("description")} /></Field>
        </Section>

        <Section title="Eligibility criteria">
          <Field label="Minimum CGPA"><Input type="number" step="0.1" value={f.minCgpa} onChange={set("minCgpa")} /></Field>
          <Field label="Max active backlogs"><Input type="number" value={f.maxBacklogs} onChange={set("maxBacklogs")} /></Field>
          <Field label="Eligible branches" wide>
            <div className="flex flex-wrap gap-4">
              {BRANCHES.map((b) => (
                <label key={b} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={branches.includes(b)}
                    onCheckedChange={(c) => setBranches((p) => (c ? [...p, b] : p.filter((x) => x !== b)))}
                  />
                  {b}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Eligible batches" wide>
            <div className="flex gap-4">
              {[2026, 2027].map((b) => (
                <label key={b} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={batches.includes(b)}
                    onCheckedChange={(c) => setBatches((p) => (c ? [...p, b] : p.filter((x) => x !== b)))}
                  />
                  {b}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Preferred skills (comma separated)" wide><Input value={f.skills} onChange={set("skills")} placeholder="Java, SQL" /></Field>
        </Section>

        <Section title="Schedule & selection process">
          <Field label="Application deadline"><Input type="date" value={f.deadline} onChange={set("deadline")} /></Field>
          <Field label="Drive date"><Input type="date" value={f.driveDate} onChange={set("driveDate")} /></Field>
          <Field label="Rounds (one per line)" wide><Textarea rows={4} value={f.rounds} onChange={set("rounds")} /></Field>
        </Section>

        <div className="form-actions flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/recruiter" })}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "Saving drive…" : "Submit for approval"}</Button>
        </div>
      </form>
    </Shell>
  );
}
