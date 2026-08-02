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
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

const description =
  "Luck Life is an intelligent productivity platform designed to help users organize their daily life, focus deeply, manage tasks efficiently, build habits, and track long-term progress.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Luck Life — version, roadmap & credits" },
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

const roadmap = [
  { title: "Habit streak engine", note: "Long-term consistency scoring", state: "done" },
  { title: "Focus soundscapes", note: "Ambient audio during Pomodoro", state: "progress" },
  { title: "Full Arabic localization", note: "RTL-perfect copy across every screen", state: "progress" },
  { title: "Team spaces", note: "Shared projects and review loops", state: "planned" },
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
  return (
    <AppShell
      breadcrumb="About"
      eyebrow="Workspace / About"
      title="About Luck Life"
      subtitle="The story, the status and what comes next."
    >
      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <section className="card-surface animate-fade-in overflow-hidden p-8">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary transition-transform duration-300 hover:scale-105">
              <Sparkles className="size-7" />
            </span>
            <div>
              <h2 className="text-3xl font-bold">Luck Life</h2>
              <p className="text-muted-foreground">Intelligent productivity platform</p>
            </div>
          </div>
          <p className="mt-6 text-lg leading-relaxed">{description}</p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {facts.map((f, i) => (
              <div
                key={f.label}
                className="animate-fade-in rounded-2xl border border-border bg-muted/40 p-5 transition-colors hover:border-primary"
                style={{ animationDelay: `${i * 45}ms` }}
              >
                <dt className="eyebrow">{f.label}</dt>
                <dd className="mt-1 text-lg font-semibold">{f.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="grid gap-6">
          <section className="card-surface animate-fade-in p-7">
            <div className="flex items-center gap-3">
              <Rocket className="size-5 text-primary" />
              <h2 className="text-xl font-bold">Roadmap preview</h2>
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
                    <span className="block font-semibold">{r.title}</span>
                    <span className="block text-sm text-muted-foreground">{r.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card-surface animate-fade-in p-7">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-primary" />
              <h2 className="text-xl font-bold">Developer</h2>
            </div>
            <p className="mt-4 font-semibold">Luck Labs</p>
            <p className="text-muted-foreground">
              A small product studio building calm, focused software for daily work.
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
              <h2 className="text-xl font-bold">Acknowledgements</h2>
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
              © 2026 Luck Labs. All rights reserved.
            </p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
