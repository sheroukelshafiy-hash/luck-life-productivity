import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { AppointmentDialog } from "@/components/lifehub/AppointmentDialog";
import { DayTimeline } from "@/components/lifehub/DayTimeline";
import { useT, useLocale } from "@/lib/i18n";
import { toISODate } from "@/lib/luck-live-store";
import { useToday } from "@/lib/use-now";
import {
  appointmentTypeLabel,
  colorFor,
  useLifeHub,
  weekDates,
  type Appointment,
} from "@/lib/life-hub-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Planner — Luck Life appointments" },
      {
        name: "description",
        content: "Plan meetings, classes, travel and personal events with day, week and month views.",
      },
      { property: "og:title", content: "Planner — Luck Life appointments" },
      {
        property: "og:description",
        content: "Day, week and month views for every appointment in your life.",
      },
    ],
  }),
  component: PlannerPage,
});

type View = "timeline" | "day" | "week" | "month";

function AppointmentCard({ a, onClick }: { a: Appointment; onClick: () => void }) {
  const t = useT();
  return (
    <button
      onClick={onClick}
      style={{ borderInlineStartColor: colorFor(a.color) }}
      className="lift press w-full rounded-2xl border border-border border-s-4 bg-card p-4 text-start transition-all duration-200"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">{a.title}</span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          {t(appointmentTypeLabel[a.type])}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="size-4" />
          {a.start} – {a.end}
        </span>
        {a.location ? (
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            {a.location}
          </span>
        ) : null}
      </div>
      {a.notes ? <p className="mt-2 text-sm text-muted-foreground">{a.notes}</p> : null}
    </button>
  );
}

function PlannerPage() {
  const t = useT();
  const locale = useLocale();
  const now = useToday();
  const { appointments, openAppointmentDialog } = useLifeHub();
  const [view, setView] = useState<View>("timeline");
  const [cursor, setCursor] = useState(() => new Date());

  const byDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments) {
      map.set(a.date, [...(map.get(a.date) ?? []), a]);
    }
    for (const list of map.values()) list.sort((x, y) => x.start.localeCompare(y.start));
    return map;
  }, [appointments]);

  const step = (delta: number) => {
    const d = new Date(cursor);
    if (view === "day" || view === "timeline") d.setDate(d.getDate() + delta);
    else if (view === "week") d.setDate(d.getDate() + delta * 7);
    else d.setMonth(d.getMonth() + delta);
    setCursor(d);
  };

  const heading =
    view === "month"
      ? cursor.toLocaleDateString(locale, { month: "long", year: "numeric" })
      : view === "week"
        ? `${weekDates(cursor)[0]!.toLocaleDateString(locale, { month: "short", day: "numeric" })} – ${weekDates(cursor)[6]!.toLocaleDateString(locale, { month: "short", day: "numeric" })}`
        : cursor.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" });

  const todayISOv = toISODate(now);

  return (
    <AppShell
      breadcrumb="Planner"
      eyebrow="Life Hub / Planner"
      title="Plan the rest of your life."
      subtitle="Appointments, meetings and events — separate from your tasks, together in one view."
    >
      <section className="card-surface lift p-4 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">{t("Planner")}</p>
            <h2 key={heading} className="mt-2 animate-fade-in text-2xl font-bold">
              {heading}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex gap-1 rounded-2xl bg-muted/60 p-1.5">
              {(["timeline", "day", "week", "month"] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200",
                    view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(v === "timeline" ? "Timeline" : v === "day" ? "Day" : v === "week" ? "Week" : "Month")}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCursor(new Date())}
              className="press rounded-xl bg-muted px-4 py-3 font-semibold transition-colors hover:bg-accent"
            >
              {t("Today")}
            </button>
            <button
              aria-label={t("Previous")}
              onClick={() => step(-1)}
              className="press rounded-xl bg-muted p-3 transition-colors hover:bg-accent"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              aria-label={t("Next")}
              onClick={() => step(1)}
              className="press rounded-xl bg-muted p-3 transition-colors hover:bg-accent"
            >
              <ChevronRight className="size-5" />
            </button>
            <button
              onClick={() => openAppointmentDialog({ date: toISODate(cursor) })}
              className="press flex items-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
            >
              <Plus className="size-5" />
              <span className="hidden sm:inline">{t("New appointment")}</span>
            </button>
          </div>
        </div>

        <div key={`${view}-${heading}`} className="mt-6 animate-fade-in">
          {view === "timeline" ? <DayTimeline date={toISODate(cursor)} /> : null}

          {view === "day" ? (
            <div className="space-y-3">
              {(byDate.get(toISODate(cursor)) ?? []).length ? (
                byDate
                  .get(toISODate(cursor))!
                  .map((a) => (
                    <AppointmentCard key={a.id} a={a} onClick={() => openAppointmentDialog({ id: a.id })} />
                  ))
              ) : (
                <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                  {t("Nothing scheduled. Add your first appointment for this day.")}
                </p>
              )}
            </div>
          ) : null}

          {view === "week" ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
              {weekDates(cursor).map((d) => {
                const iso = toISODate(d);
                const list = byDate.get(iso) ?? [];
                return (
                  <div
                    key={iso}
                    onDoubleClick={() => openAppointmentDialog({ date: iso })}
                    className={cn(
                      "min-h-40 rounded-2xl border p-3 transition-colors",
                      iso === todayISOv ? "border-primary/70 bg-primary/10" : "border-border",
                    )}
                  >
                    <p className="text-sm font-semibold">
                      {d.toLocaleDateString(locale, { weekday: "short", day: "numeric" })}
                    </p>
                    <div className="mt-2 space-y-2">
                      {list.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => openAppointmentDialog({ id: a.id })}
                          style={{ borderInlineStartColor: colorFor(a.color) }}
                          className="press w-full rounded-lg border-s-4 bg-muted/60 px-2 py-1.5 text-start text-xs transition-colors hover:bg-accent"
                        >
                          <span className="block truncate font-medium">{a.title}</span>
                          <span className="text-muted-foreground">{a.start}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {view === "month" ? <MonthGrid cursor={cursor} byDate={byDate} todayISOv={todayISOv} /> : null}
        </div>
      </section>

      <AppointmentDialog />
    </AppShell>
  );
}

function MonthGrid({
  cursor,
  byDate,
  todayISOv,
}: {
  cursor: Date;
  byDate: Map<string, Appointment[]>;
  todayISOv: string;
}) {
  const t = useT();
  const { openAppointmentDialog } = useLifeHub();
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="grid grid-cols-7 gap-2 text-sm text-muted-foreground sm:gap-3">
      {dayNames.map((d) => (
        <span key={d} className="px-1 pb-1">
          {t(d)}
        </span>
      ))}
      {Array.from({ length: first }).map((_, i) => (
        <div key={`pad-${i}`} className="min-h-16 rounded-xl border border-border/60 sm:min-h-24" />
      ))}
      {Array.from({ length: days }).map((_, i) => {
        const iso = toISODate(new Date(year, month, i + 1));
        const list = byDate.get(iso) ?? [];
        return (
          <button
            key={iso}
            onClick={() => openAppointmentDialog({ date: iso })}
            className={cn(
              "flex min-h-16 flex-col rounded-xl border p-2 text-start transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] sm:min-h-24",
              iso === todayISOv ? "border-primary/70 bg-primary/10" : "border-border hover:border-primary/60",
            )}
          >
            <span className="text-base font-medium text-foreground">{i + 1}</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {list.slice(0, 4).map((a) => (
                <span key={a.id} className="size-2 rounded-full" style={{ background: colorFor(a.color) }} />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
