import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { CompletionChart, FocusSession, ProgressRing } from "@/components/luck/widgets";
import { useLuckLive } from "@/lib/luck-live-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Luck Live daily cockpit" },
      {
        name: "description",
        content: "See daily progress, streaks, focus sessions and today's tasks in one calm cockpit.",
      },
      { property: "og:title", content: "Overview — Luck Live daily cockpit" },
      {
        property: "og:description",
        content: "Daily progress, streaks, focus sessions and today's tasks in one calm cockpit.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { tasks, completion } = useLuckLive();
  const done = tasks.filter((t) => t.done).length;

  return (
    <AppShell
      breadcrumb="Overview"
      eyebrow="Your daily cockpit"
      title="Make today count."
      subtitle="You have a clear runway. Two high-impact tasks and a little momentum will get you there."
    >
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="card-surface p-7">
          <p className="eyebrow">Daily progress</p>
          <h2 className="mt-2 text-2xl font-bold">Thursday, July 30</h2>
          <p className="mt-1 text-muted-foreground">Keep the streak alive, one finish at a time.</p>
          <div className="mt-8 flex flex-wrap items-center gap-8">
            <ProgressRing value={completion} />
            <div className="min-w-0">
              <p className="text-xl font-bold">
                {done} of {tasks.length} tasks
              </p>
              <p className="mt-1 text-muted-foreground">Your progress updates as tasks are finished.</p>
              <p className="mt-3 font-medium">• 5 day streak</p>
            </div>
          </div>
        </section>

        <FocusSession />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="card-surface p-7">
          <p className="eyebrow">Momentum</p>
          <h2 className="mt-2 mb-6 text-2xl font-bold">Completion rate</h2>
          <CompletionChart />
        </section>
        <section className="card-surface p-7">
          <p className="eyebrow">Next up</p>
          <h2 className="mt-2 text-2xl font-bold">Today's tasks</h2>
          <ul className="mt-4 space-y-2 text-lg text-muted-foreground">
            {tasks.slice(0, 3).map((t) => (
              <li key={t.id}>{t.title}</li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
