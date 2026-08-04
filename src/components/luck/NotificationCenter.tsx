import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, Trash2, CalendarClock, Timer, Trophy, BarChart3 } from "lucide-react";
import { useLuckLive, todayISO } from "@/lib/luck-live-store";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Note = {
  id: string;
  kind: "reminder" | "due" | "pomodoro" | "achievement" | "weekly";
  title: string;
  body: string;
  at: number;
};

const READ_KEY = "luck-life-notifications-v1";

function icon(kind: Note["kind"]) {
  switch (kind) {
    case "reminder":
      return CalendarClock;
    case "due":
      return CalendarClock;
    case "pomodoro":
      return Timer;
    case "achievement":
      return Trophy;
    default:
      return BarChart3;
  }
}

function timeAgo(at: number, t: (k: string) => string) {
  const s = Math.max(0, Math.floor((Date.now() - at) / 1000));
  if (s < 60) return t("just now");
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function NotificationCenter() {
  const { tasks, settings } = useLuckLive();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<string[]>([]);
  const [cleared, setCleared] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(READ_KEY);
      if (raw) {
        const p = JSON.parse(raw) as { read?: string[]; cleared?: string[] };
        setRead(p.read ?? []);
        setCleared(p.cleared ?? []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(READ_KEY, JSON.stringify({ read, cleared }));
    } catch {
      /* ignore */
    }
  }, [read, cleared]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const notes = useMemo<Note[]>(() => {
    const today = todayISO();
    const list: Note[] = [];
    const base = Date.now();

    if (settings.taskReminders) {
      for (const task of tasks) {
        if (task.done) continue;
        if (task.reminder) {
          list.push({
            id: `rem-${task.id}`,
            kind: "reminder",
            title: t("Upcoming reminder"),
            body: task.title,
            at: base,
          });
        }
        if ((task.date ?? today) === today) {
          list.push({
            id: `due-${task.id}`,
            kind: "due",
            title: t("Due today"),
            body: task.title,
            at: base,
          });
        }
      }
    }

    if (settings.pomodoroNotifications) {
      list.push({
        id: "pomodoro-daily",
        kind: "pomodoro",
        title: t("Pomodoro complete"),
        body: t("Focus session finished. Time for a break."),
        at: base - 1000 * 60 * 42,
      });
    }

    const done = tasks.filter((x) => x.done).length;
    if (settings.achievementAlerts && tasks.length > 0 && done >= tasks.length / 2) {
      list.push({
        id: `ach-half-${today}`,
        kind: "achievement",
        title: t("Achievement"),
        body: t("Nice work — you crossed half of today's list."),
        at: base - 1000 * 60 * 10,
      });
    }

    if (settings.weeklyReview || settings.dailySummary) {
      list.push({
        id: "weekly-summary",
        kind: "weekly",
        title: t("Weekly summary"),
        body: t("Your weekly review is ready."),
        at: base - 1000 * 60 * 60 * 5,
      });
    }

    return list.filter((n) => !cleared.includes(n.id));
  }, [tasks, settings, cleared, t]);

  const unread = notes.filter((n) => !read.includes(n.id)).length;

  return (
    <div ref={rootRef} className="relative">
      <button
        className="relative rounded-2xl border border-border bg-card p-3 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground active:translate-y-0"
        aria-label={t("Notifications")}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Bell className="size-5" />
        {unread > 0 ? (
          <span className="absolute -end-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="card-surface absolute end-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] origin-top animate-scale-in overflow-hidden p-0">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <p className="font-semibold">{t("Notification center")}</p>
            <div className="flex gap-1">
              <button
                onClick={() => setRead(notes.map((n) => n.id))}
                aria-label={t("Mark all as read")}
                title={t("Mark all as read")}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Check className="size-4" />
              </button>
              <button
                onClick={() => setCleared((c) => [...new Set([...c, ...notes.map((n) => n.id)])])}
                aria-label={t("Clear all")}
                title={t("Clear all")}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notes.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto size-7 text-muted-foreground/60" />
                <p className="mt-3 text-muted-foreground">{t("You're all caught up.")}</p>
              </div>
            ) : (
              notes.map((n, i) => {
                const Icon = icon(n.kind);
                const isUnread = !read.includes(n.id);
                return (
                  <button
                    key={n.id}
                    onClick={() => setRead((r) => (r.includes(n.id) ? r : [...r, n.id]))}
                    style={{ animationDelay: `${i * 30}ms` }}
                    className={cn(
                      "flex w-full animate-fade-in items-start gap-3 border-b border-border px-4 py-3 text-start transition-colors last:border-0 hover:bg-muted/50",
                      isUnread && "bg-primary/5",
                    )}
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-semibold">{n.title}</span>
                        {isUnread ? <span className="size-2 shrink-0 rounded-full bg-primary" /> : null}
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">{n.body}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(n.at, t)}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
