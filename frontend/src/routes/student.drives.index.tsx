import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { DriveCard } from "@/components/DriveCard";
import { PageHeader, Shell } from "@/components/Shell";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { checkEligibility, useStore } from "@/lib/store";

export const Route = createFileRoute("/student/drives/")({
  head: () => ({
    meta: [
      { title: "Placement Drives — CampusHire" },
      {
        name: "description",
        content:
          "Browse and filter approved placement drives by role, location, package and eligibility.",
      },
      { property: "og:title", content: "Placement Drives — CampusHire" },
      {
        property: "og:description",
        content: "Approved campus placement drives with eligibility shown up front.",
      },
    ],
  }),
  component: DrivesPage,
});

function DrivesPage() {
  const session = useStore((s) => s.session);
  const student = useStore((s) => s.students.find((x) => x.id === session?.id));
  const drives = useStore((s) => s.drives);

  const [q, setQ] = useState("");
  const [location, setLocation] = useState("all");
  const [type, setType] = useState("all");
  const [onlyEligible, setOnlyEligible] = useState(false);

  const approved = useMemo(() => drives.filter((d) => d.status === "approved"), [drives]);
  const locations = Array.from(new Set(approved.map((d) => d.location)));

  const results = approved.filter((d) => {
    const text = `${d.role} ${d.company} ${d.skills.join(" ")}`.toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (location !== "all" && d.location !== location) return false;
    if (type !== "all" && d.type !== type) return false;
    if (onlyEligible && student && !checkEligibility(d, student).eligible) return false;
    return true;
  });

  return (
    <Shell>
      <PageHeader
        title="Placement drives"
        description="Approved opportunities for the current season."
      />

      <div className="drive-search-bar relative mb-6 max-w-2xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search role, company or skill"
          className="h-11 pl-9"
        />
      </div>

      <div className="drive-layout">
        <aside className="drive-filters surface h-fit p-4" aria-label="Filter placement drives">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Refine results</h2>
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => {
                setLocation("all");
                setType("all");
                setOnlyEligible(false);
              }}
            >
              Reset
            </button>
          </div>
          <div className="filter-group">
            <Label htmlFor="location-filter">Location</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="location-filter" className="mt-2 w-full">
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {locations.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="filter-group">
            <Label htmlFor="type-filter">Employment type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type-filter" className="mt-2 w-full">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
                <SelectItem value="Intern + FTE">Intern + FTE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <Label htmlFor="elig" className="text-sm">
              Eligible for me
            </Label>
            <Switch id="elig" checked={onlyEligible} onCheckedChange={setOnlyEligible} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">Matching opportunities</p>
            <p className="text-xs text-muted-foreground">{results.length} found</p>
          </div>
          <div className="drive-results space-y-3">
            {results.map((d) => (
              <DriveCard key={d.id} drive={d} student={student} />
            ))}
            {!results.length ? (
              <div className="surface px-6 py-12 text-center">
                <Search className="mx-auto size-5 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">No matching drives</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try removing a filter or changing your search.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Shell>
  );
}
