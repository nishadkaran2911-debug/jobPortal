import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, Shell, StatCard } from "@/components/Shell";
import { useStore, type AppStatus, type Branch } from "@/lib/store";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Placement Analytics — CampusHire" },
      { name: "description", content: "Branch-wise placement rates, offers and application funnel for the season." },
      { property: "og:title", content: "Placement Analytics — CampusHire" },
      { property: "og:description", content: "Placement season analytics for the Placement Cell." },
    ],
  }),
  component: Analytics,
});

const BRANCHES: Branch[] = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"];
const FUNNEL: AppStatus[] = ["applied", "shortlisted", "interview", "selected"];

function Bar({ label, value, max, suffix = "" }: { label: string; value: number; max: number; suffix?: string }) {
  return (
    <div className="analytics-bar grid grid-cols-[80px_1fr_56px] items-center gap-3 text-sm">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-500"
          style={{ width: `${max ? (value / max) * 100 : 0}%` }}
        />
      </div>
      <span className="text-right text-sm font-semibold tabular-nums">{value}{suffix}</span>
    </div>
  );
}

function Analytics() {
  const students = useStore((s) => s.students);
  const drives = useStore((s) => s.drives);
  const applications = useStore((s) => s.applications);
  const live = drives.filter((d) => d.status !== "rejected" && d.ctcMax > 0);
  const avg = live.reduce((t, d) => t + (d.ctcMin + d.ctcMax) / 2, 0) / (live.length || 1);
  const highest = Math.max(0, ...live.map((d) => d.ctcMax));
  const placed = students.filter((s) => s.placed).length;
  const rank: Record<AppStatus, number> = { applied: 0, shortlisted: 1, interview: 2, selected: 3, rejected: -1 };

  return (
    <Shell>
      <PageHeader title="Placement analytics" description="Season 2026–27 · live figures from the portal." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Placement rate" value={`${Math.round((placed / students.length) * 100)}%`} hint={`${placed} of ${students.length} students`} />
        <StatCard label="Average CTC" value={`₹${avg.toFixed(1)} LPA`} />
        <StatCard label="Highest CTC" value={`₹${highest} LPA`} />
        <StatCard label="Companies" value={new Set(drives.map((d) => d.company)).size} />
      </div>
      <div className="analytics-layout mt-8 grid gap-8 lg:grid-cols-2">
        <section className="chart-panel surface space-y-4 p-6">
          <h2 className="text-sm font-semibold">Branch-wise placement rate</h2>
          {BRANCHES.map((b) => {
            const all = students.filter((s) => s.branch === b);
            const p = all.filter((s) => s.placed).length;
            return <Bar key={b} label={b} value={all.length ? Math.round((p / all.length) * 100) : 0} max={100} suffix="%" />;
          })}
        </section>
        <section className="chart-panel surface space-y-4 p-6">
          <h2 className="text-sm font-semibold">Application funnel</h2>
          {FUNNEL.map((st) => (
            <Bar key={st} label={st[0]!.toUpperCase() + st.slice(1)} value={applications.filter((a) => rank[a.status] >= rank[st]).length} max={applications.length} />
          ))}
        </section>
        <section className="chart-panel surface space-y-4 p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold">Applications per drive</h2>
          {drives.map((d) => (
            <div key={d.id} className="grid grid-cols-[1fr_2fr_40px] items-center gap-3 text-sm">
              <span className="truncate text-muted-foreground">{d.company}</span>
              <div className="h-2 rounded-full bg-secondary">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${(applications.filter((a) => a.driveId === d.id).length / Math.max(1, applications.length)) * 100}%` }} />
              </div>
              <span className="text-right font-medium">{applications.filter((a) => a.driveId === d.id).length}</span>
            </div>
          ))}
        </section>
      </div>
    </Shell>
  );
}
