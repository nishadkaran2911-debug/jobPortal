import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader, Shell } from "@/components/Shell";
import { Pill } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateStudent, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/students")({
  head: () => ({
    meta: [
      { title: "Students — CampusHire Placement Cell" },
      { name: "description", content: "Manage student records, applications and publish placement results." },
      { property: "og:title", content: "Students — CampusHire Placement Cell" },
      { property: "og:description", content: "Student records and placement results." },
    ],
  }),
  component: Students,
});

function Students() {
  const students = useStore((s) => s.students);
  const applications = useStore((s) => s.applications);
  const [q, setQ] = useState("");
  const rows = students.filter((s) => `${s.name} ${s.branch}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <Shell>
      <PageHeader
        title="Students"
        description="Verified student records. Mark students as placed to publish results."
        action={<Input placeholder="Search name or branch" value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />}
      />
      <div className="directory-table surface overflow-x-auto">
        <table className="data-table w-full text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Branch</th>
              <th className="px-5 py-3 font-medium">Batch</th>
              <th className="px-5 py-3 font-medium">CGPA</th>
              <th className="px-5 py-3 font-medium">Backlogs</th>
              <th className="px-5 py-3 font-medium">Applications</th>
              <th className="px-5 py-3 font-medium">Result</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                </td>
                <td className="px-5 py-3">{s.branch}</td>
                <td className="px-5 py-3">{s.batch}</td>
                <td className="px-5 py-3">{s.cgpa.toFixed(1)}</td>
                <td className="px-5 py-3">{s.backlogs}</td>
                <td className="px-5 py-3">{applications.filter((a) => a.studentId === s.id).length}</td>
                <td className="px-5 py-3">
                  <Pill variant={s.placed ? "green" : "neutral"}>{s.placed ? "Placed" : "Unplaced"}</Pill>
                </td>
                <td className="px-5 py-3 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      updateStudent(s.id, { placed: !s.placed });
                      toast.success(s.placed ? "Result withdrawn" : `Result published for ${s.name}`);
                    }}
                  >
                    {s.placed ? "Mark unplaced" : "Publish placed"}
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
