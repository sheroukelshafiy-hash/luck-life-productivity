import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Circle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Luck Live streak view" },
      { name: "description", content: "A monthly view of daily finishes so your streak stays visible." },
      { property: "og:title", content: "Calendar — Luck Live streak view" },
      { property: "og:description", content: "A monthly view of daily finishes so your streak stays visible." },
    ],
  }),
  component: CalendarPage,
});

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarPage() {
  const [month, setMonth] = useState(7); // August
  const year = 2026;
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const label = new Date(year, month, 1).toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <AppShell
      breadcrumb="Calendar"
      eyebrow="Workspace / Calendar"
      title="Your month at a glance"
      subtitle="Track daily finishes and keep the streak visible."
    >
      <section className="card-surface p-4 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Monthly view</p>
            <h2 className="mt-2 text-2xl font-bold">{label}</h2>
          </div>
          <div className="flex gap-3">
            <button
              aria-label="Previous month"
              onClick={() => setMonth((m) => (m + 11) % 12)}
              className="rounded-xl bg-muted p-3 transition-colors hover:bg-accent"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              aria-label="Next month"
              onClick={() => setMonth((m) => (m + 1) % 12)}
              className="rounded-xl bg-muted p-3 transition-colors hover:bg-accent"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2 text-sm text-muted-foreground sm:gap-3">
          {dayNames.map((d) => (
            <span key={d} className="px-1 pb-1">
              {d.slice(0, 3)}
            </span>
          ))}
          {Array.from({ length: first }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-16 rounded-xl border border-border/60 sm:min-h-28" />
          ))}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const complete = day === 1;
            return (
              <div
                key={day}
                className={cn(
                  "flex min-h-16 flex-col rounded-xl border p-2 sm:min-h-28 sm:p-3",
                  complete ? "border-success bg-success/15" : "border-border",
                )}
              >
                <span className="text-base font-medium text-foreground">{day}</span>
                <span className="mt-auto self-end">
                  {complete ? (
                    <span className="flex size-6 items-center justify-center rounded-md bg-success text-success-foreground">
                      <Check className="size-4" />
                    </span>
                  ) : (
                    <Circle className="size-5 text-muted-foreground/50" />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
