import { createFileRoute } from "@tanstack/react-router";
import { FileText, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader, Shell } from "@/components/Shell";
import { Pill } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateStudent, useStore } from "@/lib/store";
import { uploadResume } from "@/lib/api";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — CampusHire" },
      { name: "description", content: "Manage your academic record, skills and resume for placements." },
      { property: "og:title", content: "My Profile — CampusHire" },
      { property: "og:description", content: "Your academic record, skills and resume." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const session = useStore((s) => s.session);
  const student = useStore((s) => s.students.find((x) => x.id === s.session?.id));
  const [phone, setPhone] = useState(student?.phone ?? "");
  const [skill, setSkill] = useState("");
  const [resumeUploading, setResumeUploading] = useState(false);

  if (!session || !student) return <Shell>{null}</Shell>;

  const addSkill = () => {
    const v = skill.trim();
    if (!v || student.skills.includes(v)) return;
    updateStudent(student.id, { skills: [...student.skills, v] });
    setSkill("");
  };

  return (
    <Shell>
      <PageHeader
        title="Profile"
        description="Academic details are verified by the Placement Cell. Contact them to correct any errors."
      />
      <div className="student-profile-layout grid gap-6 lg:grid-cols-3">
        <div className="surface p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold">Academic record</h2>
          <dl className="profile-fields mt-4 grid gap-x-6 sm:grid-cols-2">
            {[
              ["Full name", student.name],
              ["College email", student.email],
              ["Branch", student.branch],
              ["Batch", String(student.batch)],
              ["CGPA", student.cgpa.toFixed(2)],
              ["Active backlogs", String(student.backlogs)],
            ].map(([k, v]) => (
              <div key={k} className="profile-field">
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="mt-1 text-sm font-medium">{v}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-8 text-sm font-semibold">Contact</h2>
          <div className="profile-form-row mt-3 flex max-w-md gap-2">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} aria-label="Phone" />
            <Button
              variant="outline"
              onClick={() => {
                updateStudent(student.id, { phone });
                toast.success("Phone number updated");
              }}
            >
              Save
            </Button>
          </div>

          <h2 className="mt-8 text-sm font-semibold">Skills</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {student.skills.map((s) => (
              <Pill key={s}>
                {s}
                <button
                  aria-label={`Remove ${s}`}
                  onClick={() =>
                    updateStudent(student.id, { skills: student.skills.filter((x) => x !== s) })
                  }
                >
                  <X className="size-3" />
                </button>
              </Pill>
            ))}
          </div>
          <div className="profile-form-row mt-3 flex max-w-md gap-2">
            <Input
              placeholder="Add a skill, e.g. Docker"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
            />
            <Button variant="outline" onClick={addSkill}>
              Add
            </Button>
          </div>
        </div>

        <div className="surface h-fit p-6">
          <h2 className="text-sm font-semibold">Resume</h2>
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-border p-3">
            <FileText className="size-5 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{student.resumeName || "No resume"}</p>
              <p className="text-xs text-muted-foreground">PDF · shared with recruiters</p>
            </div>
          </div>
          <Label htmlFor="resume" className="mt-4 block">
            <span className="inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-md border border-input text-sm font-medium hover:bg-secondary">
              {resumeUploading ? "Uploading resume…" : "Replace resume"}
            </span>
          </Label>
          <input
            id="resume"
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={resumeUploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 5_000_000) {
                toast.error("Resume must be smaller than 5 MB");
                e.target.value = "";
                return;
              }
              setResumeUploading(true);
              try {
                const uploaded = await uploadResume(student.id, file);
                updateStudent(student.id, {
                  resumeName: uploaded.filename,
                  resumeFileId: uploaded.fileId,
                });
                toast.success("Resume saved to your profile");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Resume upload failed");
              } finally {
                setResumeUploading(false);
                e.target.value = "";
              }
            }}
          />
          <p className="mt-6 text-xs text-muted-foreground">
            Placement status: {student.placed ? "Placed" : "Open to offers"}
          </p>
        </div>
      </div>
    </Shell>
  );
}
