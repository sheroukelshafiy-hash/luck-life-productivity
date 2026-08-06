import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, UserPlus, Circle, Play, Pause, Link2, Copy, Check, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const description =
  "Focus Together lets you run a shared Pomodoro room with friends — synced timer, live participants and focus status, no chat, no noise.";

export const Route = createFileRoute("/focus-together")({
  head: () => ({
    meta: [
      { title: "Focus Together — shared focus rooms | Luck Life" },
      { name: "description", content: description },
      { property: "og:title", content: "Focus Together — shared focus rooms" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FocusTogetherPage,
});

type Status = "available" | "busy" | "focus";

const statusToken: Record<Status, string> = {
  available: "text-success",
  busy: "text-destructive",
  focus: "text-primary",
};

const statusLabel: Record<Status, string> = {
  available: "Available",
  busy: "Busy",
  focus: "In Focus",
};

const participants: { name: string; initials: string; status: Status; streak: number; progress: number }[] = [
  { name: "Shorouq", initials: "SH", status: "focus", streak: 12, progress: 68 },
  { name: "Mariam", initials: "MA", status: "focus", streak: 6, progress: 41 },
  { name: "Youssef", initials: "YO", status: "available", streak: 3, progress: 0 },
  { name: "Hana", initials: "HA", status: "busy", streak: 9, progress: 0 },
];

function FocusTogetherPage() {
  const t = useT();
  const [mode, setMode] = useState<"solo" | "together">("together");
  const [status, setStatus] = useState<Status>("focus");
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const inviteCode = "LUCK-4F2A";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <AppShell
      breadcrumb="Focus Together"
      eyebrow="Life Hub / Focus"
      title="Focus Together"
      subtitle="Share a timer, keep each other accountable — quietly."
    >
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="card-surface animate-fade-in p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-2xl bg-muted/60 p-1.5">
              {(["solo", "together"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200",
                    mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(m === "solo" ? "Solo" : "Together")}
                </button>
              ))}
            </div>
            <span className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm">
              <Users className="size-4 text-primary" />
              {participants.filter((p) => p.status === "focus").length} {t("in focus now")}
            </span>
          </div>

          <div className="mt-7 rounded-2xl bg-primary p-8 text-primary-foreground">
            <p className="text-xs font-bold uppercase tracking-[0.12em] opacity-80">
              {t(mode === "solo" ? "Solo room" : "Shared room")}
            </p>
            <p dir="ltr" className="mt-4 text-6xl font-extrabold tabular-nums">
              25:00
            </p>
            <p className="mt-2 opacity-80">{t("Everyone in the room shares this timer.")}</p>
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={() => setRunning((r) => !r)}
                className="press flex size-14 items-center justify-center rounded-full bg-background text-primary transition-transform duration-200 hover:scale-105"
                aria-label={running ? t("Pause session") : t("Start session")}
              >
                {running ? <Pause className="size-6" /> : <Play className="size-6" />}
              </button>
              <p className="text-sm opacity-85">
                {running ? t("Room is focusing. Notifications muted.") : t("Waiting to start.")}
              </p>
            </div>
          </div>

          <div className="mt-7">
            <p className="eyebrow">{t("Your status")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["available", "busy", "focus"] as Status[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={cn(
                    "press flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5",
                    status === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
                  )}
                >
                  <Circle className={cn("size-3 fill-current", statusToken[s])} />
                  {t(statusLabel[s])}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-6">
          <section className="card-surface animate-fade-in p-7">
            <div className="flex items-center gap-3">
              <UserPlus className="size-5 text-primary" />
              <h2 className="text-xl font-bold">{t("Invite friends")}</h2>
            </div>
            <p className="mt-3 text-muted-foreground">
              {t("Share this room code. Anyone with it joins your synced timer.")}
            </p>
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-3">
              <Link2 className="size-4 text-muted-foreground" />
              <span dir="ltr" className="flex-1 font-mono text-lg font-bold tracking-wider">
                {inviteCode}
              </span>
              <button
                onClick={copy}
                aria-label={t("Copy invite code")}
                className="press rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
              </button>
            </div>
            <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
              {t("No chat, ever. Focus rooms stay silent by design.")}
            </p>
          </section>

          <section className="card-surface animate-fade-in p-7">
            <h2 className="text-xl font-bold">{t("Participants")}</h2>
            <ul className="mt-5 space-y-3">
              {participants.map((p, i) => (
                <li
                  key={p.name}
                  style={{ animationDelay: `${i * 50}ms` }}
                  className="animate-fade-in flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-muted/60"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                    {p.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className={cn("flex items-center gap-1.5 text-sm", statusToken[p.status])}>
                      <Circle className="size-2.5 fill-current" />
                      {t(statusLabel[p.status])}
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        style={{ width: `${p.progress}%` }}
                        className="h-full rounded-full bg-primary transition-all duration-700"
                      />
                    </div>
                  </div>
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {p.streak}
                    {t("d streak")}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
