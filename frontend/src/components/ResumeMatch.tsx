import { CheckCircle2, CircleAlert } from "lucide-react";

import { Pill } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { getResumeMatch, type Drive, type Student } from "@/lib/store";

export function ResumeMatchPanel({ drive, student }: { drive: Drive; student: Student }) {
  const match = getResumeMatch(drive, student);

  return (
    <div className="surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold">Resume match</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Based on your skills, resume status and this role's requirements.
          </p>
        </div>
        <Pill variant={match.score >= 80 ? "green" : match.score >= 55 ? "amber" : "red"}>
          {match.score}%
        </Pill>
      </div>
      <Progress value={match.score} className="mt-4" />
      <p className="mt-2 text-xs font-medium text-muted-foreground">{match.strength}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Matching skills
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {match.matched.length ? (
              match.matched.map((skill) => (
                <Pill key={skill} variant="green">
                  <CheckCircle2 className="size-3" />
                  {skill}
                </Pill>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No required skills matched yet.</span>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Improve these
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {match.missing.length ? (
              match.missing.map((skill) => (
                <Pill key={skill} variant="amber">
                  <CircleAlert className="size-3" />
                  {skill}
                </Pill>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No missing required skills.</span>
            )}
          </div>
        </div>
      </div>

      <ul className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
        {match.suggestions.map((suggestion) => (
          <li key={suggestion}>{suggestion}</li>
        ))}
      </ul>
    </div>
  );
}
