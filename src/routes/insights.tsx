import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { CompletionChart, CountUp } from "@/components/luck/widgets";
import { useT } from "@/lib/i18n";
import { useLuckLive } from "@/lib/luck-live-store";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights — Luck Life momentum analytics" },
      { name: "description", content: "Weekly completion rate, focus hours and streak analytics for your workspace." },
      { property: "og:title", content: "Insights — Luck Life momentum analytics" },
      { property: "og:description", content: "Weekly completion rate, focus hours and streak analytics." },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const { completion } = useLuckLive();
  const t = useT();
  const stats = [
    { label: "Completion rate", value: completion, decimals: 0, suffix: "%", note: "Today" },
    { label: "Focus hours", value: 12.5, decimals: 1, suffix: "", note: "This week" },
    { label: "Current streak", value: 5, decimals: 0, suffix: ` ${t("days")}`, note: "Keep it alive" },
    { label: "Tasks finished", value: 38, decimals: 0, suffix: "", note: "Last 30 days" },
  ];

  return (
    <AppShell
      breadcrumb="Insights"
      eyebrow="Workspace / Insights"
      title="Momentum, measured."
      subtitle="A calm read on how your week is actually going."
    >
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <section
            key={s.label}
            style={{ animationDelay: `${i * 60}ms` }}
            className="card-surface lift animate-fade-in p-6"
          >
            <p className="eyebrow">{t(s.label)}</p>
            <p className="mt-3 text-4xl font-bold text-primary">
              <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} />
            </p>
            <p className="mt-1 text-muted-foreground">{t(s.note)}</p>
          </section>
        ))}
      </div>

      <section className="card-surface lift mt-6 p-7">
        <p className="eyebrow">{t("Momentum")}</p>
        <h2 className="mt-2 mb-6 text-2xl font-bold">{t("Completion rate")}</h2>
        <CompletionChart />
      </section>
    </AppShell>
  );
}
