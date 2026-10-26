import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader, Shell, StatCard } from "@/components/Shell";
import { DriveStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Placement Cell Dashboard — CampusHire" },
      { name: "description", content: "Monitor the placement season: drives, approvals, students and offers." },
      { property: "og:title", content: "Placement Cell Dashboard — CampusHire" },
      { property: "og:description", content: "Season overview for the college Placement Cell." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const drives = useStore((s) => s.drives);
  const students = useStore((s) => s.students);
  const recruiters = useStore((s) => s.recruiters);
  const applications = useStore((s) => s.applications);
  const pending = drives.filter((d) => d.status === "pending").length + recruiters.filter((r) => !r.approved).length;
  const placed = students.filter((s) => s.placed).length;
  const upcoming = drives.filter((d) => d.status === "approved").sort((a, b) => a.driveDate.localeCompare(b.driveDate));

  return (
    <Shell>
      <PageHeader
        title="Placement season 2026–27"
        description="Overview of drives, students and recruitment progress."
        action={<Button asChild><Link to="/admin/approvals">Review approvals ({pending})</Link></Button>}
      />
      <div className="admin-summary grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Live drives" value={drives.filter((d) => d.status === "approved").length} />
        <StatCard label="Pending approvals" value={pending} hint="Drives and companies" />
        <StatCard label="Students placed" value={`${placed} / ${students.length}`} hint={`${Math.round((placed / students.length) * 100)}% placement rate`} />
        <StatCard label="Applications" value={applications.length} />
      </div>
      <div className="admin-overview mt-8 grid gap-8 lg:grid-cols-2">
        <section className="admin-agenda">
          <h2 className="text-sm font-semibold">Upcoming drives</h2>
          <ul className="agenda-list mt-3 divide-y divide-border">
            {upcoming.map((d) => (
              <li key={d.id} className="agenda-item flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{d.company}</p>
                  <p className="text-xs text-muted-foreground">{d.role} · {formatDate(d.driveDate)}</p>
                </div>
                <span className="text-xs text-muted-foreground">{applications.filter((a) => a.driveId === d.id).length} applicants</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="admin-drive-status">
          <h2 className="text-sm font-semibold">All drives</h2>
          <ul className="mt-3 divide-y divide-border">
            {drives.map((d) => (
              <li key={d.id} className="drive-status-row flex items-center justify-between gap-3 py-3 text-sm">
                <span className="truncate">{d.company} — {d.role}</span>
                <DriveStatusBadge status={d.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Shell>
  );
}
