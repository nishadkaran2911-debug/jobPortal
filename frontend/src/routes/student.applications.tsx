import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { CompanyMark } from "@/components/DriveCard";
import { PageHeader, Shell, StatCard } from "@/components/Shell";
import { ApplicationStatus } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate, useStore, type AppStatus } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/applications")({
  head: () => ({
    meta: [
      { title: "My Applications — CampusHire" },
      { name: "description", content: "Track the status of every placement drive you have applied to." },
      { property: "og:title", content: "My Applications — CampusHire" },
      { property: "og:description", content: "Track your placement applications stage by stage." },
    ],
  }),
  component: MyApplications,
});

const STAGES: AppStatus[] = ["applied", "shortlisted", "interview", "selected"];
const STAGE_LABEL: Record<string, string> = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  interview: "Interview",
  selected: "Selected",
};

function MyApplications() {
  const session = useStore((s) => s.session);
  const drives = useStore((s) => s.drives);
  const applications = useStore((s) => s.applications);
  const mine = applications
    .filter((a) => a.studentId === session?.id)
    .sort((a, b) => b.appliedOn.localeCompare(a.appliedOn));

  return (
    <Shell>
      <PageHeader
        title="My applications"
        description="Every drive you have applied to this season, and where it stands."
      />
      <div className="application-summary mb-8 grid gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={mine.length} />
        <StatCard
          label="In progress"
          value={mine.filter((a) => ["applied", "shortlisted", "interview"].includes(a.status)).length}
        />
        <StatCard label="Offers" value={mine.filter((a) => a.status === "selected").length} />
        <StatCard label="Closed" value={mine.filter((a) => a.status === "rejected").length} />
      </div>

      {!mine.length ? (
        <div className="application-empty surface p-10 text-center">
          <p className="text-sm text-muted-foreground">You haven't applied to any drives yet.</p>
          <Button asChild className="mt-4">
            <Link to="/student/drives">Browse drives</Link>
          </Button>
        </div>
      ) : (
        <div className="application-list space-y-3">
          {mine.map((a) => {
            const d = drives.find((x) => x.id === a.driveId);
            if (!d) return null;
            const idx = STAGES.indexOf(a.status);
            return (
              <div key={a.id} className="application-row surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <CompanyMark tone={d.logoTone} />
                    <div>
                      <Link
                        to="/student/drives/$driveId"
                        params={{ driveId: d.id }}
                        className="font-medium hover:underline"
                      >
                        {d.role}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {d.company} · {d.location} · Applied {formatDate(a.appliedOn)}
                      </p>
                    </div>
                  </div>
                  <ApplicationStatus status={a.status} />
                </div>
                {a.status === "rejected" ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {a.note ?? "The company did not move forward with your application."}
                  </p>
                ) : (
                  <ol className="application-stages mt-5 grid grid-cols-4 gap-2">
                    {STAGES.map((st, i) => (
                      <li key={st} className="flex flex-col gap-2">
                        <div className={cn("h-1 rounded-full", i <= idx ? "bg-primary" : "bg-border")} />
                        <span
                          className={cn(
                            "flex items-center gap-1 text-xs",
                            i <= idx ? "font-medium text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {i <= idx ? <Check className="size-3" /> : null}
                          {STAGE_LABEL[st]}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
                {a.note && a.status !== "rejected" ? (
                  <p className="mt-3 text-sm text-success">{a.note}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
