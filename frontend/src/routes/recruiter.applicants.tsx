import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader, Shell } from "@/components/Shell";
import { ApplicationStatus, Pill } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  getResumeMatch,
  updateApplication,
  useStore,
  type AppStatus,
} from "@/lib/store";

export const Route = createFileRoute("/recruiter/applicants")({
  validateSearch: z.object({ drive: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Applicants — CampusHire" },
      { name: "description", content: "Review student applicants and move them through your selection process." },
      { property: "og:title", content: "Applicants — CampusHire" },
      { property: "og:description", content: "Review and shortlist campus applicants." },
    ],
  }),
  component: Applicants,
});

const NEXT: Partial<Record<AppStatus, { to: AppStatus; label: string }>> = {
  applied: { to: "shortlisted", label: "Shortlist" },
  shortlisted: { to: "interview", label: "Schedule interview" },
  interview: { to: "selected", label: "Select" },
};

function Applicants() {
  const { drive } = Route.useSearch();
  const navigate = Route.useNavigate();
  const session = useStore((s) => s.session);
  const drives = useStore((s) => s.drives);
  const students = useStore((s) => s.students);
  const applications = useStore((s) => s.applications);
  const mine = drives.filter((d) => d.recruiterId === session?.id);
  const ids = new Set(drive ? [drive] : mine.map((d) => d.id));
  const rows = applications.filter((a) => ids.has(a.driveId));

  return (
    <Shell>
      <PageHeader
        title="Applicants"
        description="Students who applied to your drives. Eligibility is pre-verified by the portal."
        action={
          <select
            value={drive ?? ""}
            onChange={(e) => navigate({ search: { drive: e.target.value || undefined } })}
            aria-label="Filter applicants by drive"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All drives</option>
            {mine.map((d) => <option key={d.id} value={d.id}>{d.role}</option>)}
          </select>
        }
      />
      <div className="applicant-table surface overflow-x-auto">
        <table className="data-table w-full text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Student</th>
              <th className="px-5 py-3 font-medium">Drive</th>
              <th className="px-5 py-3 font-medium">Branch / CGPA</th>
              <th className="px-5 py-3 font-medium">Resume match</th>
              <th className="px-5 py-3 font-medium">Resume</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => {
              const st = students.find((s) => s.id === a.studentId);
              const d = drives.find((x) => x.id === a.driveId);
              const next = NEXT[a.status];
              const match = st && d ? getResumeMatch(d, st) : null;
              return (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium">{st?.name}</p>
                    <p className="text-xs text-muted-foreground">Applied {formatDate(a.appliedOn)}</p>
                  </td>
                  <td className="px-5 py-3">{d?.role}</td>
                  <td className="px-5 py-3">{st?.branch} · {st?.cgpa.toFixed(1)}</td>
                  <td className="px-5 py-3">
                    {match ? (
                      <div className="space-y-1.5">
                        <Pill variant={match.score >= 80 ? "green" : match.score >= 55 ? "amber" : "red"}>
                          {match.score}% {match.strength}
                        </Pill>
                        <p className="max-w-48 text-xs text-muted-foreground">
                          {match.missing.length
                            ? `Missing: ${match.missing.join(", ")}`
                            : "All required skills matched"}
                        </p>
                      </div>
                    ) : null}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="size-3.5" /> {st?.resumeName}
                    </span>
                  </td>
                  <td className="px-5 py-3"><ApplicationStatus status={a.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      {next ? (
                        <Button size="sm" onClick={() => { updateApplication(a.id, next.to); toast.success(`${st?.name}: ${next.label.toLowerCase()}`); }}>
                          {next.label}
                        </Button>
                      ) : null}
                      {a.status !== "rejected" && a.status !== "selected" ? (
                        <Button size="sm" variant="outline" onClick={() => updateApplication(a.id, "rejected")}>Reject</Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!rows.length ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">No applicants yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
