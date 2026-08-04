import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CompletionChart, TaskRow } from "@/components/luck/widgets";
import { useLuckLive } from "@/lib/luck-live-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "My tasks — Luck Life" },
      { name: "description", content: "Your daily task list with priorities, projects and completion tracking." },
      { property: "og:title", content: "My tasks — Luck Life" },
      { property: "og:description", content: "Your daily task list with priorities, projects and completion tracking." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const { tasks, completion } = useLuckLive();
  const [range, setRange] = useState<"week" | "month">("week");
  const done = tasks.filter((t) => t.done).length;

  return (
    <AppShell
      breadcrumb="My tasks"
      eyebrow="Workspace / My tasks"
      title="Your task list"
      subtitle="Finish the next useful thing, then let momentum do the rest."
    >
      <section className="card-surface p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Daily completion</p>
            <h2 className="mt-2 text-2xl font-bold">
              {done} of {tasks.length} completed
            </h2>
          </div>
          <span className="text-3xl font-bold text-primary">{completion}%</span>
        </div>
        <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="card-surface p-7">
          <p className="eyebrow">Today's tasks</p>
          <h2 className="mt-2 text-2xl font-bold">Keep moving</h2>
          <div className="mt-4">
            {tasks.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        </section>

        <section className="card-surface p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Momentum</p>
              <h2 className="mt-2 text-2xl font-bold">Completion rate</h2>
            </div>
            <div className="flex rounded-xl bg-muted p-1">
              {(["week", "month"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "rounded-lg px-4 py-2 font-semibold capitalize transition-colors",
                    range === r ? "bg-card text-foreground" : "text-muted-foreground",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <CompletionChart />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
