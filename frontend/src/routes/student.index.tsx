import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BriefcaseBusiness, CheckCheck, FileUser, GraduationCap } from "lucide-react";

import { DriveCard } from "@/components/DriveCard";
import { PageHeader, Shell, StatCard } from "@/components/Shell";
import { ApplicationStatus } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { checkEligibility, formatDate, getResumeMatch, useStore } from "@/lib/store";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — CampusHire" },
      {
        name: "description",
        content:
          "Your placement snapshot: eligible drives, open applications and upcoming deadlines.",
      },
      { property: "og:title", content: "Student Dashboard — CampusHire" },
      {
        property: "og:description",
        content: "Eligible drives, open applications and upcoming placement deadlines.",
      },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const session = useStore((s) => s.session);
  const students = useStore((s) => s.students);
  const drives = useStore((s) => s.drives);
  const applications = useStore((s) => s.applications);

  const student = students.find((s) => s.id === session?.id);
  if (!student) return <Shell>{null}</Shell>;

  const open = drives.filter((d) => d.status === "approved");
  const mine = applications.filter((a) => a.studentId === student.id);
  const appliedIds = new Set(mine.map((a) => a.driveId));
  const eligible = open.filter((d) => checkEligibility(d, student).eligible);
  const recommended = eligible
    .filter((d) => !appliedIds.has(d.id))
    .sort((a, b) => getResumeMatch(b, student).score - getResumeMatch(a, student).score)
    .slice(0, 3);
  const profileScore =
    40 +
    (student.skills.length >= 3 ? 20 : 10) +
    (student.resumeName ? 25 : 0) +
    (student.phone ? 15 : 0);

  return (
    <Shell>
      <PageHeader
        title={`Welcome back, ${student.name.split(" ")[0]}`}
        description={`${student.branch} · Batch ${student.batch} · CGPA ${student.cgpa.toFixed(2)}`}
        action={
          <Button asChild>
            <Link to="/student/drives">
              Browse drives <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BriefcaseBusiness}
          label="Open drives"
          value={open.length}
          hint="Approved by placement cell"
        />
        <StatCard
          icon={CheckCheck}
          label="Eligible matches"
          value={eligible.length}
          hint="Based on your record"
        />
        <StatCard
          icon={FileUser}
          label="Applications"
          value={mine.length}
          hint="Across this season"
        />
        <StatCard
          icon={GraduationCap}
          label="Active backlogs"
          value={student.backlogs}
          hint={student.backlogs === 0 ? "Clean academic record" : "Affects some drives"}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Recommended for you</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Eligible roles ranked by resume match
              </p>
            </div>
            <Link
              to="/student/drives"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              All drives <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recommended.length ? (
              recommended.map((d) => <DriveCard key={d.id} drive={d} student={student} />)
            ) : (
              <p className="surface p-6 text-sm text-muted-foreground">
                You have applied to every drive you are currently eligible for.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Profile strength</h2>
              <span className="text-lg font-semibold tabular-nums text-primary">
                {profileScore}%
              </span>
            </div>
            <Progress value={profileScore} className="mt-3" />
            <p className="mt-2 text-xs text-muted-foreground">
              {student.resumeName ? "Resume uploaded" : "Add a resume to improve your matches"}
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link to="/student/profile">
                Complete profile <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          <div className="surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recent activity</h2>
              <Link
                to="/student/applications"
                className="text-xs font-medium text-primary hover:underline"
              >
                Track all
              </Link>
            </div>
            <ul className="mt-4 space-y-4">
              {mine.slice(0, 4).map((a) => {
                const drive = drives.find((d) => d.id === a.driveId);
                return (
                  <li
                    key={a.id}
                    className="flex items-start justify-between gap-3 border-l-2 border-primary/20 pl-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{drive?.role}</p>
                      <p className="text-xs text-muted-foreground">
                        {drive?.company} · {formatDate(a.appliedOn)}
                      </p>
                    </div>
                    <ApplicationStatus status={a.status} />
                  </li>
                );
              })}
              {!mine.length ? (
                <li className="text-sm text-muted-foreground">No applications yet.</li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>
    </Shell>
  );
}
