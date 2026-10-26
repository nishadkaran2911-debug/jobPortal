import type { AppStatus, DriveStatus } from "@/lib/store";
import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  green: "bg-success-soft text-success border-success/20",
  amber: "bg-warning-soft text-warning-foreground border-warning/30",
  red: "bg-danger-soft text-destructive border-destructive/20",
  neutral: "bg-secondary text-muted-foreground border-border",
  navy: "bg-accent text-accent-foreground border-border",
};

const appTone: Record<AppStatus, { label: string; tone: string }> = {
  applied: { label: "Applied", tone: "neutral" },
  shortlisted: { label: "Shortlisted", tone: "navy" },
  interview: { label: "Interview", tone: "amber" },
  selected: { label: "Selected", tone: "green" },
  rejected: { label: "Not selected", tone: "red" },
};

const driveTone: Record<DriveStatus, { label: string; tone: string }> = {
  pending: { label: "Pending approval", tone: "amber" },
  approved: { label: "Approved", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
  closed: { label: "Closed", tone: "neutral" },
};

export function Pill({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        tone[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ApplicationStatus({ status }: { status: AppStatus }) {
  const s = appTone[status];
  return <Pill variant={s.tone as keyof typeof tone}>{s.label}</Pill>;
}

export function DriveStatusBadge({ status }: { status: DriveStatus }) {
  const s = driveTone[status];
  return <Pill variant={s.tone as keyof typeof tone}>{s.label}</Pill>;
}
