import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { CheckCircle2, ChevronLeft, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { CompanyMark } from "@/components/DriveCard";
import { ResumeMatchPanel } from "@/components/ResumeMatch";
import { Shell } from "@/components/Shell";
import { ApplicationStatus, Pill } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { applyToDrive, checkEligibility, formatCtc, formatDate, useStore } from "@/lib/store";

export const Route = createFileRoute("/student/drives/$driveId")({
  head: () => ({
    meta: [
      { title: "Drive details — CampusHire" },
      {
        name: "description",
        content:
          "Role, package, selection process and eligibility criteria for this campus placement drive.",
      },
      { property: "og:title", content: "Drive details — CampusHire" },
      {
        property: "og:description",
        content: "Eligibility check, selection rounds and deadlines for this placement drive.",
      },
    ],
  }),
  component: DriveDetail,
});

function DriveDetail() {
  const { driveId } = useParams({ from: "/student/drives/$driveId" });
  const navigate = useNavigate();
  const session = useStore((s) => s.session);
  const student = useStore((s) => s.students.find((x) => x.id === session?.id));
  const drive = useStore((s) => s.drives.find((d) => d.id === driveId));
  const application = useStore((s) =>
    s.applications.find((a) => a.driveId === driveId && a.studentId === session?.id),
  );

  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const [note, setNote] = useState("");

  if (!drive || !student) {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground">This drive is no longer available.</p>
      </Shell>
    );
  }

  const { criteria, eligible } = checkEligibility(drive, student);

  const submit = () => {
    if (!consent) {
      toast.error("Please confirm your details before submitting.");
      return;
    }
    applyToDrive(drive.id, student.id);
    setOpen(false);
    toast.success("Application submitted to the placement cell.");
    navigate({ to: "/student/applications" });
  };

  return (
    <Shell>
      <Link
        to="/student/drives"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> All drives
      </Link>

      <div className="drive-summary surface mb-6 p-6">
        <div className="flex items-start gap-4">
          <CompanyMark tone={drive.logoTone} />
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">{drive.role}</h1>
            <p className="text-sm text-muted-foreground">
              {drive.company} · {drive.location}
            </p>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-5 sm:grid-cols-4">
          {[
            ["Package", formatCtc(drive)],
            ["Type", drive.type],
            ["Openings", String(drive.openings)],
            ["Apply by", formatDate(drive.deadline)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
              <dd className="mt-1 text-sm font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        {drive.stipend ? <p className="mt-4 text-sm text-muted-foreground">{drive.stipend}</p> : null}
      </div>

      <div className="drive-detail-layout grid gap-6 lg:grid-cols-3">
        <div className="drive-detail-content order-2 space-y-6 lg:order-1 lg:col-span-2">
          <div className="surface p-6">
            <h2 className="text-sm font-semibold">About the role</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {drive.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {drive.skills.map((s) => (
                <Pill key={s}>{s}</Pill>
              ))}
            </div>
          </div>

          <ResumeMatchPanel drive={drive} student={student} />

          <div className="surface p-6">
            <h2 className="text-sm font-semibold">Selection process</h2>
            <ol className="mt-4 space-y-4">
              {drive.rounds.map((r, i) => (
                <li key={r} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-xs font-medium text-muted-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{r}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
              Campus drive scheduled for {formatDate(drive.driveDate)}.
            </p>
          </div>
        </div>

        <div className="drive-eligibility order-1 space-y-4 lg:order-2">
          <div className="surface p-6">
            <h2 className="text-sm font-semibold">Eligibility check</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Matched against your academic record.
            </p>
            <ul className="mt-4 space-y-3.5">
              {criteria.map((c) => (
                <li key={c.label} className="flex items-start gap-2.5">
                  {c.ok ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                  ) : (
                    <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="text-xs text-muted-foreground">{c.detail}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div
              className={
                eligible
                  ? "mt-5 rounded-lg border border-success/20 bg-success-soft px-4 py-3 text-sm font-medium text-success"
                  : "mt-5 rounded-lg border border-destructive/20 bg-danger-soft px-4 py-3 text-sm font-medium text-destructive"
              }
            >
              {eligible
                ? "You are eligible to apply"
                : "You are not eligible for this drive"}
            </div>
            {!eligible ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Reason: {criteria.filter((c) => !c.ok).map((c) => c.label.toLowerCase()).join(", ")}{" "}
                not met. Contact the placement cell if your record needs correction.
              </p>
            ) : null}

            <div className="mt-5">
              {application ? (
                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary px-4 py-3">
                  <span className="text-sm">Application status</span>
                  <ApplicationStatus status={application.status} />
                </div>
              ) : (
                <Button className="w-full" disabled={!eligible} onClick={() => setOpen(true)}>
                  {eligible ? "Apply to this drive" : "Not eligible"}
                </Button>
              )}
            </div>
          </div>

          <div className="surface p-6">
            <h2 className="text-sm font-semibold">Company criteria</h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              {[
                ["Minimum CGPA", drive.minCgpa.toFixed(1)],
                ["Branches", drive.branches.join(", ")],
                ["Batches", drive.batches.join(", ")],
                [
                  "Backlogs",
                  drive.maxBacklogs === 0 ? "None allowed" : `Up to ${drive.maxBacklogs}`,
                ],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to {drive.company}</DialogTitle>
            <DialogDescription>
              {drive.role} · {formatCtc(drive)} · {drive.location}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-secondary p-4 text-sm">
              <p className="font-medium">{student.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {student.branch} · Batch {student.batch} · CGPA {student.cgpa.toFixed(2)} ·{" "}
                {student.backlogs} backlog(s)
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Resume: {student.resumeName}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">Note to recruiter (optional)</Label>
              <Textarea
                id="note"
                value={note}
                maxLength={400}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything the recruiter should know about your projects or internships."
              />
            </div>
            <label className="flex items-start gap-2.5 text-sm">
              <Checkbox
                checked={consent}
                onCheckedChange={(v) => setConsent(v === true)}
                className="mt-0.5"
              />
              <span className="text-muted-foreground">
                I confirm my profile and resume are up to date and agree to the placement cell's
                one-offer policy.
              </span>
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>Submit application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
