import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { CompanyMark } from "@/components/DriveCard";
import { PageHeader, Shell, StatCard } from "@/components/Shell";
import { DriveStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatCtc, formatDate, useStore } from "@/lib/store";

export const Route = createFileRoute("/recruiter/")({
  head: () => ({
    meta: [
      { title: "Recruiter Dashboard — CampusHire" },
      { name: "description", content: "Manage your campus drives and applicant pipeline." },
      { property: "og:title", content: "Recruiter Dashboard — CampusHire" },
      { property: "og:description", content: "Your campus drives and applicant pipeline at a glance." },
    ],
  }),
  component: RecruiterDashboard,
});

function RecruiterDashboard() {
  const session = useStore((s) => s.session);
  const drives = useStore((s) => s.drives);
  const applications = useStore((s) => s.applications);
  const mine = drives.filter((d) => d.recruiterId === session?.id);
  const ids = new Set(mine.map((d) => d.id));
  const apps = applications.filter((a) => ids.has(a.driveId));

  return (
    <Shell>
      <PageHeader
        title={`Hello, ${session?.name.split(" ")[0] ?? ""}`}
        description="Drives you've submitted to the Placement Cell and their applicant pipelines."
        action={
          <Button asChild>
            <Link to="/recruiter/create-drive">
              <Plus className="size-4" /> New drive
            </Link>
          </Button>
        }
      />
      <div className="recruiter-summary grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active drives" value={mine.filter((d) => d.status === "approved").length} />
        <StatCard label="Awaiting approval" value={mine.filter((d) => d.status === "pending").length} />
        <StatCard label="Total applicants" value={apps.length} />
        <StatCard label="Shortlisted" value={apps.filter((a) => a.status !== "applied" && a.status !== "rejected").length} />
      </div>

      <div className="recruiter-drive-table surface mt-8 overflow-x-auto">
        <table className="data-table w-full text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Drive</th>
              <th className="px-5 py-3 font-medium">CTC</th>
              <th className="px-5 py-3 font-medium">Deadline</th>
              <th className="px-5 py-3 font-medium">Applicants</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {mine.map((d) => (
              <tr key={d.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <CompanyMark tone={d.logoTone} />
                    <div>
                      <p className="font-medium">{d.role}</p>
                      <p className="text-xs text-muted-foreground">{d.company} · {d.location}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">{formatCtc(d)}</td>
                <td className="px-5 py-3">{formatDate(d.deadline)}</td>
                <td className="px-5 py-3">{applications.filter((a) => a.driveId === d.id).length}</td>
                <td className="px-5 py-3"><DriveStatusBadge status={d.status} /></td>
                <td className="px-5 py-3 text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/recruiter/applicants" search={{ drive: d.id }}>View</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
