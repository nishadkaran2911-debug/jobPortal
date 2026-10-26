import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Briefcase, CalendarClock, IndianRupee, MapPin } from "lucide-react";

import { Pill } from "@/components/StatusBadge";
import {
  checkEligibility,
  daysLeft,
  formatCtc,
  formatDate,
  getResumeMatch,
  type Drive,
  type Student,
} from "@/lib/store";

export function CompanyMark({ tone }: { tone: string }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary font-semibold text-sm text-primary transition-colors">
      {tone}
    </span>
  );
}

export function DriveCard({ drive, student }: { drive: Drive; student?: Student | undefined }) {
  const elig = student ? checkEligibility(drive, student) : null;
  const match = student ? getResumeMatch(drive, student) : null;
  const left = daysLeft(drive.deadline);

  return (
    <Link
      to="/student/drives/$driveId"
      params={{ driveId: drive.id }}
      className="drive-card surface block p-4 transition-colors hover:border-primary/40 sm:p-5"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <CompanyMark tone={drive.logoTone} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="truncate text-[15px] font-semibold tracking-tight">{drive.role}</h3>
            {elig ? (
              <Pill variant={elig.eligible ? "green" : "red"}>
                {elig.eligible ? "Eligible" : "Not eligible"}
              </Pill>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{drive.company}</p>
          <div className="drive-card-meta mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {drive.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="size-3.5" />
              {drive.type}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-3.5" />
              {left > 0 ? `${left} days left` : "Closed"} · {formatDate(drive.deadline)}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
              <IndianRupee className="size-3.5 text-muted-foreground" />
              {formatCtc(drive)}
            </span>
            {match ? (
              <span className="text-xs text-muted-foreground">Resume match {match.score}%</span>
            ) : null}
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary">
              View role <ArrowUpRight className="size-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
