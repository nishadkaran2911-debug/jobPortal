import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { CompanyMark } from "@/components/DriveCard";
import { PageHeader, Shell } from "@/components/Shell";
import { DriveStatusBadge, Pill } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCtc, formatDate, setDriveStatus, setRecruiterApproved, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/approvals")({
  head: () => ({
    meta: [
      { title: "Drive & Company Approvals — CampusHire" },
      { name: "description", content: "Approve or reject placement drives and recruiting companies." },
      { property: "og:title", content: "Drive & Company Approvals — CampusHire" },
      { property: "og:description", content: "Placement Cell review queue for drives and companies." },
    ],
  }),
  component: Approvals,
});

function Approvals() {
  const drives = useStore((s) => s.drives);
  const recruiters = useStore((s) => s.recruiters);
  const sorted = [...drives].sort((a, b) => (a.status === "pending" ? -1 : 0) - (b.status === "pending" ? -1 : 0));

  return (
    <Shell>
      <PageHeader title="Approvals" description="Only approved drives from approved companies are visible to students." />
      <Tabs defaultValue="drives" className="approval-tabs">
        <TabsList>
          <TabsTrigger value="drives">Drives ({drives.filter((d) => d.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="companies">Companies ({recruiters.filter((r) => !r.approved).length})</TabsTrigger>
        </TabsList>
        <TabsContent value="drives" className="approval-list mt-4 space-y-3">
          {sorted.map((d) => (
            <article key={d.id} className="approval-row surface flex flex-wrap items-start justify-between gap-4 p-5">
              <div className="flex gap-3">
                <CompanyMark tone={d.logoTone} />
                <div>
                  <p className="font-medium">{d.role} <span className="font-normal text-muted-foreground">· {d.company}</span></p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {formatCtc(d)} · {d.location} · Deadline {formatDate(d.deadline)}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    CGPA ≥ {d.minCgpa} · {d.branches.join(", ")} · Batch {d.batches.join("/")} · ≤ {d.maxBacklogs} backlogs
                  </p>
                </div>
              </div>
              <div className="approval-actions flex items-center gap-2">
                <DriveStatusBadge status={d.status} />
                {d.status === "pending" ? (
                  <>
                    <Button size="sm" onClick={() => { setDriveStatus(d.id, "approved"); toast.success(`${d.company} drive approved`); }}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => setDriveStatus(d.id, "rejected")}>Reject</Button>
                  </>
                ) : d.status === "approved" ? (
                  <Button size="sm" variant="ghost" onClick={() => setDriveStatus(d.id, "closed")}>Close drive</Button>
                ) : null}
              </div>
            </article>
          ))}
        </TabsContent>
        <TabsContent value="companies" className="approval-list mt-4 space-y-3">
          {recruiters.map((r) => (
            <article key={r.id} className="approval-row surface flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-medium">{r.company}</p>
                <p className="text-sm text-muted-foreground">{r.name} · {r.email}</p>
              </div>
              <div className="approval-actions flex items-center gap-2">
                <Pill variant={r.approved ? "green" : "amber"}>{r.approved ? "Verified" : "Pending verification"}</Pill>
                {r.approved ? (
                  <Button size="sm" variant="ghost" onClick={() => setRecruiterApproved(r.id, false)}>Revoke</Button>
                ) : (
                  <Button size="sm" onClick={() => { setRecruiterApproved(r.id, true); toast.success(`${r.company} verified`); }}>Approve</Button>
                )}
              </div>
            </article>
          ))}
        </TabsContent>
      </Tabs>
    </Shell>
  );
}
