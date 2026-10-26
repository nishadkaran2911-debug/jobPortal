import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { GraduationCap, LogOut, Menu, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { logout, useStore, type Role } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV: Record<Role, { to: string; label: string }[]> = {
  student: [
    { to: "/student", label: "Dashboard" },
    { to: "/student/drives", label: "Placement drives" },
    { to: "/student/applications", label: "My applications" },
    { to: "/student/profile", label: "Profile" },
  ],
  recruiter: [
    { to: "/recruiter", label: "Dashboard" },
    { to: "/recruiter/create-drive", label: "Create drive" },
    { to: "/recruiter/applicants", label: "Applicants" },
  ],
  admin: [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/approvals", label: "Approvals" },
    { to: "/admin/students", label: "Students" },
    { to: "/admin/analytics", label: "Analytics" },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  student: "Student",
  recruiter: "Recruiter",
  admin: "Placement Cell",
};

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5 font-semibold tracking-tight", className)}>
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
        <GraduationCap className="size-4" strokeWidth={2.5} />
      </span>
      <span className="font-semibold tracking-[-0.03em]">CampusHire</span>
    </span>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const session = useStore((s) => s.session);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <Brand />
        <p className="text-sm text-muted-foreground">
          Please sign in to access this area of the portal.
        </p>
        <Button onClick={() => navigate({ to: "/login" })}>Go to sign in</Button>
      </div>
    );
  }

  const items = NAV[session.role];
  const isActive = (to: string) =>
    to === `/${session.role === "admin" ? "admin" : session.role}`
      ? pathname === to
      : pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Link to="/">
            <Brand className="text-[15px]" />
          </Link>
          <nav aria-label="Main navigation" className="hidden h-full items-center gap-5 md:flex">
            {items.map((i) => (
              <Link
                key={i.to}
                to={i.to}
                className={cn(
                  "inline-flex h-full items-center border-b-2 border-transparent px-1 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground",
                  isActive(i.to) && "border-primary font-medium text-foreground",
                )}
              >
                {i.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-medium">{session.name}</p>
              <p className="text-xs text-muted-foreground">{ROLE_LABEL[session.role]}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Sign out"
              onClick={() => {
                void logout().catch((error: unknown) => {
                  console.error("Could not revoke sign-in session:", error);
                });
                navigate({ to: "/" });
              }}
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon" aria-label="Open navigation menu">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-6">
                <nav aria-label="Mobile navigation" className="mt-8 flex flex-col gap-1">
                  {items.map((i) => (
                    <Link
                      key={i.to}
                      to={i.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "rounded px-3 py-2 text-sm text-muted-foreground hover:bg-secondary",
                        isActive(i.to) && "bg-secondary font-semibold text-foreground",
                      )}
                    >
                      {i.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="portal-main mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-header mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="surface group relative overflow-hidden p-5 transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2.5 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
        </div>
        {Icon ? (
          <span className="stat-card-icon flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary transition-transform duration-200 group-hover:scale-110">
            <Icon className="size-4" strokeWidth={2} />
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
