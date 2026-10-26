import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  MapPin,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Brand } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCtc, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CampusHire — College Placement Portal" },
      {
        name: "description",
        content:
          "Verified placement drives, clear eligibility and application tracking for students, recruiters and the placement cell.",
      },
    ],
  }),
  component: Landing,
});

const ROLES = [
  {
    icon: Users,
    title: "Students",
    body: "See verified drives that fit your profile, understand eligibility before applying and follow every application.",
  },
  {
    icon: Building2,
    title: "Recruiters",
    body: "Submit a placement drive with role requirements and review applicants in one focused workspace.",
  },
  {
    icon: ShieldCheck,
    title: "Placement Cell",
    body: "Review company and drive approvals, oversee hiring progress and keep student records together.",
  },
];

function Landing() {
  const drives = useStore((s) => s.drives);
  const applications = useStore((s) => s.applications);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [branch, setBranch] = useState("");
  const matches = useMemo(
    () =>
      drives.filter((d) => {
        if (d.status !== "approved") return false;
        const term = query.trim().toLowerCase();
        const place = location.trim().toLowerCase();
        const searchable = `${d.role} ${d.company} ${d.skills.join(" ")}`.toLowerCase();
        return (
          (!term || searchable.includes(term)) &&
          (!place || d.location.toLowerCase().includes(place)) &&
          (!branch || d.branches.includes(branch as (typeof d.branches)[number]))
        );
      }),
    [drives, query, location, branch],
  );
  const featured = matches[0];
  const disciplines = [
    ...new Set(drives.filter((d) => d.status === "approved").flatMap((d) => d.branches)),
  ];

  return (
    <div className="landing-page min-h-screen bg-background">
      <AnimatedBackground />
      <header className="landing-header border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Brand />
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-7 text-sm text-muted-foreground md:flex"
          >
            <a href="#opportunities" className="transition-colors hover:text-foreground">
              Find opportunities
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#for-campus" className="transition-colors hover:text-foreground">
              For campus
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/login">
                Open portal <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
          <div className="landing-hero-copy">
            <p className="landing-enter text-xs font-semibold uppercase tracking-[.16em] text-primary">
              Campus placements · 2026–27
            </p>
            <h1 className="landing-enter landing-enter-delay mt-4">
              Find your place
              <br />
              in <em>what comes</em> next.
            </h1>
            <p className="landing-enter landing-enter-delay-2 mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Explore placement drives approved by your college, check your eligibility and keep
              every application in view.
            </p>
            <form
              className="landing-search mt-8"
              onSubmit={(e) => {
                e.preventDefault();
                document.getElementById("opportunities")?.scrollIntoView({ behavior: "smooth" });
              }}
              role="search"
              aria-label="Search placement drives"
            >
              <label className="flex min-w-0 items-center gap-2 px-2">
                <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Role, company or skill"
                  aria-label="Search role, company or skill"
                />
              </label>
              <label className="flex min-w-0 items-center gap-2 border-t border-border px-2 sm:border-l sm:border-t-0">
                <MapPin aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or remote"
                  aria-label="Filter by location"
                />
              </label>
              <Button type="submit">
                Find drives <ArrowRight />
              </Button>
            </form>
            <p className="mt-3 text-xs text-muted-foreground">
              Browse approved opportunities. Sign in to see your eligibility and apply.
            </p>
          </div>

          <aside className="product-stage" aria-label="Illustrative CampusHire product preview">
            <div className="product-stage-note">
              <span className="size-1.5 rounded-full bg-primary" /> Product preview{" "}
              <span>Sample portal data</span>
            </div>
            {featured ? (
              <Link
                to="/student/drives/$driveId"
                params={{ driveId: featured.id }}
                className="product-job surface"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Featured opportunity
                  </span>
                  <span className="rounded bg-success-soft px-2 py-1 text-[10px] font-semibold text-success">
                    Approved
                  </span>
                </div>
                <div className="mt-5 flex items-start gap-3">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-semibold text-primary">
                    {featured.logoTone}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold tracking-tight">
                      {featured.role}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">{featured.company}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {featured.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BriefcaseBusiness className="size-3.5" />
                    {featured.type}
                  </span>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">{formatCtc(featured)}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                    Review role <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            ) : (
              <div className="product-job surface p-6 text-sm text-muted-foreground">
                No approved drives match those filters.
              </div>
            )}
            <div className="product-tracker">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Illustrative workflow
                  </p>
                  <p className="mt-1 text-sm font-semibold">Application progress</p>
                </div>
                <span className="text-xs text-muted-foreground">Example</span>
              </div>
              <div className="tracker-steps">
                <span className="tracker-step is-done">
                  <i>
                    <Check />
                  </i>
                  <span>Applied</span>
                </span>
                <span className="tracker-line is-done" />
                <span className="tracker-step is-current">
                  <i>2</i>
                  <span>Review</span>
                </span>
                <span className="tracker-line" />
                <span className="tracker-step">
                  <i>3</i>
                  <span>Interview</span>
                </span>
              </div>
            </div>
            <div className="product-side-note">
              <ShieldCheck className="size-4 text-primary" />
              <span>Eligibility is visible before you apply.</span>
            </div>
          </aside>
        </section>

        <section id="disciplines" className="border-y border-border bg-secondary/40">
          <div className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[.7fr_1.3fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Explore by discipline
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Start with your field.</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {disciplines.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setBranch(branch === item ? "" : item);
                    document
                      .getElementById("opportunities")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  aria-pressed={branch === item}
                  className="discipline-link"
                >
                  {item}
                  <span>
                    {
                      drives.filter((d) => d.status === "approved" && d.branches.includes(item))
                        .length
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="opportunities" className="bg-background">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Approved by the placement cell
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  {branch ? `${branch} opportunities` : "Current placement drives"}
                </h2>
              </div>
              <span className="text-sm text-muted-foreground">
                {matches.length} {matches.length === 1 ? "opportunity" : "opportunities"}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {matches.map((d) => (
                <Link
                  key={d.id}
                  to="/student/drives/$driveId"
                  params={{ driveId: d.id }}
                  className="drive-card surface flex items-center gap-4 p-4"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary text-sm font-semibold text-primary">
                    {d.logoTone}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{d.role}</span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {d.company} · {d.location} · {d.type}
                    </span>
                  </span>
                  <span className="hidden shrink-0 text-xs font-medium sm:block">
                    {formatCtc(d)}
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
              {!matches.length && (
                <p className="col-span-full rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No approved drives match your search. Try a different role or location.
                </p>
              )}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Sign in to the student portal to review eligibility and submit an application.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="recruiter-feature">
            <div className="max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[.14em] text-blue-200">
                For hiring teams
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Bring campus hiring into focus.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Submit a drive for placement-cell approval, then manage applicants and review
                progress from one workspace.
              </p>
              <Button asChild variant="secondary" className="mt-6">
                <Link to="/login">
                  Recruiter sign in <ArrowRight />
                </Link>
              </Button>
            </div>
            <div
              className="recruiter-preview"
              aria-label="Illustrative recruiter workspace preview"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Recruiter workspace
                  </p>
                  <p className="mt-1 text-sm font-medium">Drive overview</p>
                </div>
                <span className="rounded border border-white/10 px-2 py-1 text-[10px] text-slate-300">
                  Illustrative
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] text-slate-400">Drive status</p>
                  <p className="mt-1 text-xs font-medium">Placement cell review</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Applicants</p>
                  <p className="mt-1 text-xs font-medium">Candidate list</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Next step</p>
                  <p className="mt-1 text-xs font-medium">Review profiles</p>
                </div>
              </div>
              <div className="mt-5 space-y-2">
                <div className="recruiter-preview-row">
                  <span className="size-7 rounded bg-white/10" />
                  <span className="h-2 w-2/5 rounded bg-white/30" />
                  <span className="ml-auto h-2 w-14 rounded bg-blue-300/60" />
                </div>
                <div className="recruiter-preview-row">
                  <span className="size-7 rounded bg-white/10" />
                  <span className="h-2 w-1/3 rounded bg-white/25" />
                  <span className="ml-auto h-2 w-12 rounded bg-white/20" />
                </div>
              </div>
              <p className="mt-4 text-[10px] text-slate-400">
                {applications.length} example applications in the demo dataset
              </p>
            </div>
          </div>
        </section>

        <section id="for-campus" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="mb-10 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              One verified workflow
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-[28px]">
              A clearer season for everyone
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3 md:gap-6">
            {ROLES.map((r) => (
              <article key={r.title} className="landing-role">
                <span className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                  <r.icon className="size-4 text-primary" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-sm font-semibold tracking-tight">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="border-t border-border bg-muted/60">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Before an application
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-[28px]">Know where you stand.</h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Eligibility is checked against your academic record, so requirements are clear
                before you apply.
              </p>
              <Button asChild className="mt-6">
                <Link to="/login">
                  Enter the portal <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="grid gap-x-8 sm:grid-cols-2">
              {[
                ["01", "Review", "Recruiters submit role requirements for approval."],
                ["02", "Match", "Students see eligibility and resume alignment."],
                ["03", "Track", "Recruiters update applicant stages as hiring progresses."],
                ["04", "Oversee", "The placement cell monitors drives and outcomes."],
              ].map(([number, title, description]) => (
                <div key={number} className="landing-step py-4">
                  <span className="text-xs font-semibold tabular-nums text-primary">{number}</span>
                  <div>
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-border px-4 py-7 text-xs text-muted-foreground sm:px-6">
        <Brand className="text-sm text-foreground" />
        <span className="inline-flex items-center gap-1.5">
          <BriefcaseBusiness className="size-3.5" /> Training &amp; Placement Cell · Campus Placement Portal
        </span>
      </footer>
    </div>
  );
}
