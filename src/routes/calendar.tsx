import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Check, Circle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TaskRow } from "@/components/luck/widgets";
import { useLuckLive, toISODate, todayISO } from "@/lib/luck-live-store";
import { useT, useLocale } from "@/lib/i18n";
import { useToday } from "@/lib/use-now";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Luck Life streak view" },
      { name: "description", content: "A monthly view of daily finishes so your streak stays visible." },
      { property: "og:title", content: "Calendar — Luck Life streak view" },
      { property: "og:description", content: "A monthly view of daily finishes so your streak stays visible." },
    ],
  }),
  component: CalendarPage,
});

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarPage() {
  const { tasks, openTaskDialog } = useLuckLive();
  const t = useT();
  const locale = useLocale();
  const now = useToday();
  const today = toISODate(now);
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selected, setSelected] = useState<string | null>(null);

  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const label = new Date(year, month, 1).toLocaleString(locale, { month: "long", year: "numeric" });

  const byDate = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    for (const t of tasks) {
      const key = t.date ?? todayISO();
      map.set(key, [...(map.get(key) ?? []), t]);
    }
    return map;
  }, [tasks]);

  const step = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setMonth(d.getMonth());
    setYear(d.getFullYear());
  };

  const goToday = () => {
    const d = new Date();
    setMonth(d.getMonth());
    setYear(d.getFullYear());
    setSelected(toISODate(d));
  };

  const selectedTasks = selected ? (byDate.get(selected) ?? []) : [];

  return (
    <AppShell
      breadcrumb="Calendar"
      eyebrow="Workspace / Calendar"
      title="Your month at a glance"
      subtitle="Track daily finishes and keep the streak visible."
    >
      <section className="card-surface lift p-4 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">{t("Monthly view")}</p>
            <h2 key={label} className="mt-2 animate-fade-in text-2xl font-bold">{label}</h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={goToday}
              className="press rounded-xl bg-muted px-4 py-3 font-semibold transition-colors hover:bg-accent"
            >
              {t("Today")}
            </button>
            <button
              aria-label={t("Previous month")}
              onClick={() => step(-1)}
              className="press rounded-xl bg-muted p-3 transition-colors hover:bg-accent"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              aria-label={t("Next month")}
              onClick={() => step(1)}
              className="press rounded-xl bg-muted p-3 transition-colors hover:bg-accent"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div key={`${year}-${month}`} className="mt-6 grid animate-fade-in grid-cols-7 gap-2 text-sm text-muted-foreground sm:gap-3">
          {dayNames.map((d) => (
            <span key={d} className="px-1 pb-1">
              {t(d)}
            </span>
          ))}
          {Array.from({ length: first }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-16 rounded-xl border border-border/60 sm:min-h-28" />
          ))}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const iso = toISODate(new Date(year, month, day));
            const dayTasks = byDate.get(iso) ?? [];
            const complete = dayTasks.length > 0 && dayTasks.every((t) => t.done);
            const isSelected = selected === iso;
            return (
              <button
                key={iso}
                type="button"
                aria-pressed={isSelected}
                aria-label={`${label} ${day}`}
                onClick={() => setSelected(iso)}
                onDoubleClick={() => openTaskDialog({ date: iso })}
                className={cn(
                  "flex min-h-16 flex-col rounded-xl border p-2 text-start transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] sm:min-h-28 sm:p-3",
                  complete ? "border-success bg-success/15" : "border-border hover:border-primary/60",
                  iso === today && !isSelected && "border-primary/70 bg-primary/10",
                  isSelected && "scale-[1.02] ring-2 ring-primary",
                )}
              >
                <span
                  className={cn(
                    "text-base font-medium text-foreground",
                    iso === today && "flex size-7 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground",
                  )}
                >
                  {day}
                </span>
                {dayTasks.length ? (
                  <span className="mt-1 text-xs text-muted-foreground">
                    {dayTasks.length} {t("tasks")}
                  </span>
                ) : null}
                <span className="mt-auto self-end">
                  {complete ? (
                    <span className="flex size-6 items-center justify-center rounded-md bg-success text-success-foreground">
                      <Check className="size-4" />
                    </span>
                  ) : (
                    <Circle className="size-5 text-muted-foreground/50" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {selected ? (
        <section className="card-surface lift mt-6 animate-fade-in p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">{t("Selected day")}</p>
              <h2 className="mt-2 text-2xl font-bold">
                {new Date(`${selected}T00:00:00`).toLocaleDateString(locale, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
            </div>
            <button
              onClick={() => openTaskDialog({ date: selected })}
              className="press rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
            >
              {t("Add task")}
            </button>
          </div>
          <div className="mt-4">
            {selectedTasks.length ? (
              selectedTasks.map((t) => <TaskRow key={t.id} task={t} />)
            ) : (
              <p className="text-muted-foreground">
                {t("No tasks yet for this day. Double-click a day to add one.")}
              </p>
            )}
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}

