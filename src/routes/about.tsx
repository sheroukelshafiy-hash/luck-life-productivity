import { createFileRoute } from "@tanstack/react-router";
import {
  Sparkles,
  ShieldCheck,
  Rocket,
  Heart,
  Mail,
  Globe,
  Github,
  CircleCheck,
  CircleDashed,
  Target,
  Zap,
  Users,
  Wallet,
  CalendarClock,
  Quote,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useT } from "@/lib/i18n";

const description =
  "Luck Life is an intelligent productivity platform designed to help users organize their daily life, focus deeply, manage tasks efficiently, build habits, and track long-term progress.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Luck Life — vision, roadmap & creator" },
      { name: "description", content: description },
      { property: "og:title", content: "About Luck Life" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const facts = [
  { label: "Current version", value: "2.4.0" },
  { label: "Application status", value: "Stable · Production" },
  { label: "Build number", value: "20260802.1148" },
  { label: "Release date", value: "August 2, 2026" },
  { label: "Channel", value: "General availability" },
  { label: "Platform", value: "Web · Desktop · Mobile" },
];

const pillars = [
  { icon: Target, title: "Clarity first", note: "One calm surface for tasks, time and money." },
  { icon: Zap, title: "Deep focus", note: "Pomodoro modes, streaks and honest tracking." },
  { icon: CalendarClock, title: "Real life planning", note: "Hour-by-hour days, not endless lists." },
  { icon: Wallet, title: "Money awareness", note: "Multi-currency budgeting built in." },
];

const timeline = [
  { when: "Q1 2026", title: "Foundation", note: "Tasks, insights and the petroleum design system." },
  { when: "Q2 2026", title: "Focus engine", note: "Flip-clock Pomodoro, streaks and notifications." },
  { when: "Q3 2026", title: "Life Hub", note: "Planner, Budget and hourly timeline shipped." },
  { when: "Q4 2026", title: "Together", note: "Shared focus rooms and presence status." },
];

const roadmap = [
  { title: "Habit streak engine", note: "Long-term consistency scoring", state: "done" },
  { title: "Multi-currency budgeting", note: "EGP, USD and EUR across every view", state: "done" },
  { title: "Focus soundscapes", note: "Ambient audio during Pomodoro", state: "progress" },
  { title: "Full Arabic localization", note: "RTL-perfect copy across every screen", state: "progress" },
  { title: "Live Focus Together rooms", note: "Real-time synced timers with friends", state: "planned" },
  { title: "Offline-first sync", note: "Work anywhere, reconcile later", state: "planned" },
] as const;

const credits = [
  "TanStack Start & Router",
  "Tailwind CSS",
  "Lucide icons",
  "Outfit typeface",
  "Our early access community",
];

function AboutPage() {
  const t = useT();
  return (
    <AppShell
      breadcrumb="About"
      eyebrow="Workspace / About"
      title="About Luck Life"
      subtitle="The story, the status and what comes next."
    >
      {/* Hero */}
      <section className="card-surface animate-fade-in relative overflow-hidden p-8 sm:p-12">
        <div className="pointer-events-none absolute -end-24 -top-24 size-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -start-16 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-4 py-2 text-sm font-semibold backdrop-blur-md">
            <Sparkles className="size-4 text-primary" />
            {t("Premium productivity ecosystem")}
          </span>
          <h2 className="mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            {t("Everything that runs your day, in one calm workspace.")}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t(description)}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p, i) => (
              <div
                key={p.title}
                style={{ animationDelay: `${i * 60}ms` }}
                className="animate-fade-in rounded-2xl border border-border bg-background/40 p-5 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-primary"
              >
                <p.icon className="size-5 text-primary" />
                <p className="mt-3 font-semibold">{t(p.title)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t(p.note)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <div className="grid gap-6">
          {/* Vision */}
          <section className="card-surface animate-fade-in p-8">
            <div className="flex items-center gap-3">
              <Quote className="size-5 text-primary" />
              <h2 className="text-xl font-bold">{t("Our vision")}</h2>
            </div>
            <p className="mt-5 text-lg leading-relaxed">
              {t(
                "Productivity software should feel like a quiet studio, not a control room. Luck Life brings tasks, focus, time and money into a single unhurried surface — so progress becomes the default, not the effort.",
              )}
            </p>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {facts.map((f, i) => (
                <div
                  key={f.label}
                  className="animate-fade-in rounded-2xl border border-border bg-muted/40 p-5 transition-colors hover:border-primary"
                  style={{ animationDelay: `${i * 45}ms` }}
                >
                  <dt className="eyebrow">{t(f.label)}</dt>
                  <dd className="mt-1 text-lg font-semibold">{f.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Timeline */}
          <section className="card-surface animate-fade-in p-8">
            <div className="flex items-center gap-3">
              <CalendarClock className="size-5 text-primary" />
              <h2 className="text-xl font-bold">{t("The 2026 journey")}</h2>
            </div>
            <ol className="relative mt-6 space-y-6 border-s border-border ps-6">
              {timeline.map((s, i) => (
                <li key={s.when} style={{ animationDelay: `${i * 70}ms` }} className="animate-fade-in relative">
                  <span className="absolute -start-[31px] top-1.5 size-3 rounded-full bg-primary ring-4 ring-background" />
                  <p className="eyebrow">{s.when}</p>
                  <p className="mt-1 text-lg font-semibold">{t(s.title)}</p>
                  <p className="text-muted-foreground">{t(s.note)}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="grid gap-6">
          {/* Creator */}
          <section className="card-surface animate-fade-in relative overflow-hidden p-7">
            <div className="pointer-events-none absolute -end-16 -top-16 size-48 rounded-full bg-primary/15 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <Users className="size-5 text-primary" />
                <h2 className="text-xl font-bold">{t("Creator")}</h2>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <span className="flex size-16 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
                  SA
                </span>
                <div>
                  <p className="text-lg font-bold">Shorouq Atef Elshafiey</p>
                  <p className="text-muted-foreground">{t("Founder & product designer")}</p>
                </div>
              </div>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                {t(
                  "Shorouq designs and builds Luck Life end to end — from the petroleum dark theme and gold accent identity to the focus engine and Life Hub modules.",
                )}
              </p>
            </div>
          </section>

          <section className="card-surface animate-fade-in p-7">
            <div className="flex items-center gap-3">
              <Rocket className="size-5 text-primary" />
              <h2 className="text-xl font-bold">{t("Roadmap preview")}</h2>
            </div>
            <ul className="mt-5 space-y-3">
              {roadmap.map((r) => (
                <li
                  key={r.title}
                  className="flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-muted/60"
                >
                  {r.state === "done" ? (
                    <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" />
                  ) : (
                    <CircleDashed
                      className={
                        r.state === "progress"
                          ? "mt-0.5 size-5 shrink-0 text-primary"
                          : "mt-0.5 size-5 shrink-0 text-muted-foreground"
                      }
                    />
                  )}
                  <span className="min-w-0">
                    <span className="block font-semibold">{t(r.title)}</span>
                    <span className="block text-sm text-muted-foreground">{t(r.note)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card-surface animate-fade-in p-7">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-primary" />
              <h2 className="text-xl font-bold">{t("Developer")}</h2>
            </div>
            <p className="mt-4 font-semibold">Luck Labs</p>
            <p className="text-muted-foreground">
              {t("A small product studio building calm, focused software for daily work.")}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {[
                { icon: Mail, label: "support@lucklife.app", href: "mailto:support@lucklife.app" },
                { icon: Globe, label: "lucklife.app", href: "https://lucklife.app" },
                { icon: Github, label: "GitHub", href: "https://github.com" },
              ].map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                >
                  <c.icon className="size-4" />
                  {c.label}
                </a>
              ))}
            </div>
          </section>

          <section className="card-surface animate-fade-in p-7">
            <div className="flex items-center gap-3">
              <Heart className="size-5 text-primary" />
              <h2 className="text-xl font-bold">{t("Acknowledgements")}</h2>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {credits.map((c) => (
                <li
                  key={c}
                  className="rounded-full bg-muted px-4 py-2 text-sm transition-colors hover:bg-primary/15 hover:text-primary"
                >
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              © 2026 Luck Labs. {t("All rights reserved.")}
            </p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
