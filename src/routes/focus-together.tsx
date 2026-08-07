import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Users,
  UserPlus,
  Circle,
  Play,
  Pause,
  RotateCcw,
  Link2,
  Copy,
  Check,
  ShieldCheck,
  MoreVertical,
  Timer,
  LogIn,
  LogOut,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useT } from "@/lib/i18n";
import { useLuckLive } from "@/lib/luck-live-store";
import {
  initialsOf,
  participantStatusLabel,
  participantStatuses,
  useLifeHub,
  type Participant,
  type ParticipantStatus,
} from "@/lib/life-hub-store";
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

const statusToken: Record<ParticipantStatus, string> = {
  available: "text-success",
  focus: "text-primary",
  break: "text-warning",
  busy: "text-destructive",
  offline: "text-muted-foreground",
};

const pad = (n: number) => String(n).padStart(2, "0");

function FocusTogetherPage() {
  const t = useT();
  const { settings, logFocusSession } = useLuckLive();
  const { participants, addParticipant, updateParticipant, removeParticipant } = useLifeHub();

  const [mode, setMode] = useState<"solo" | "together">("together");
  const [status, setStatus] = useState<ParticipantStatus>("available");
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);

  const [total, setTotal] = useState(settings.focusDuration * 60);
  const [seconds, setSeconds] = useState(settings.focusDuration * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const tick = useRef<number | null>(null);

  const [customOpen, setCustomOpen] = useState(false);
  const [ch, setCh] = useState("0");
  const [cm, setCm] = useState(String(settings.focusDuration));
  const [cs, setCs] = useState("0");
  const [customError, setCustomError] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [profile, setProfile] = useState<Participant | null>(null);
  const [pendingRemove, setPendingRemove] = useState<Participant | null>(null);
  const [invited, setInvited] = useState<string | null>(null);

  const inviteCode = "LUCK-4F2A";

  useEffect(() => {
    if (!running) return;
    tick.current = window.setInterval(() => setSeconds((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => {
      if (tick.current) window.clearInterval(tick.current);
    };
  }, [running]);

  useEffect(() => {
    if (seconds !== 0 || !running) return;
    setRunning(false);
    setDone(true);
    logFocusSession(total);
    if (joined) setStatus("break");
    for (const p of participants) if (p.inRoom) updateParticipant(p.id, { status: "break" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, running]);

  const inRoom = useMemo(() => participants.filter((p) => p.inRoom), [participants]);
  const focusing = participants.filter((p) => p.status === "focus").length + (status === "focus" ? 1 : 0);
  const progress = total > 0 ? ((total - seconds) / total) * 100 : 0;
  const clock = `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const applyCustom = () => {
    const [h, m, s] = [Number(ch), Number(cm), Number(cs)];
    if ([h, m, s].some((n) => !Number.isInteger(n) || n < 0)) {
      setCustomError(t("Use whole, non-negative numbers."));
      return;
    }
    if (m > 59 || s > 59) {
      setCustomError(t("Minutes and seconds must be under 60."));
      return;
    }
    const value = h * 3600 + m * 60 + s;
    if (value < 1 || value > 86400) {
      setCustomError(t("Pick a duration between 1 second and 24 hours."));
      return;
    }
    setCustomError("");
    setTotal(value);
    setSeconds(value);
    setRunning(false);
    setDone(false);
    setCustomOpen(false);
  };

  const toggleRun = () => {
    setDone(false);
    if (!running && seconds === 0) setSeconds(total);
    const next = !running;
    setRunning(next);
    if (mode === "together") {
      if (joined) setStatus(next ? "focus" : "available");
      for (const p of inRoom) updateParticipant(p.id, { status: next ? "focus" : "available" });
    } else if (joined || true) {
      setStatus(next ? "focus" : "available");
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
        <section className="card-surface animate-fade-in p-4 sm:p-7">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between">
            <div className="flex min-w-0 gap-1 rounded-2xl bg-muted/60 p-1.5">
              {(["solo", "together"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 sm:px-4",
                    mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(m === "solo" ? "Solo" : "Together")}
                </button>
              ))}
            </div>
            <span className="flex shrink-0 items-center gap-2 rounded-full bg-muted px-3 py-2 text-sm sm:px-4">
              <Users className="size-4 text-primary" />
              {focusing} {t("in focus now")}
            </span>
          </div>

          <div className="mt-7 rounded-2xl bg-primary p-5 text-primary-foreground sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.12em] opacity-80">
              {t(mode === "solo" ? "Solo room" : "Shared room")}
            </p>
            <p dir="ltr" className="mt-4 break-all text-4xl font-extrabold tabular-nums sm:text-6xl">
              {clock}
            </p>
            <p className="mt-2 opacity-80">
              {t(mode === "solo" ? "Deep work, no distractions." : "Everyone in the room shares this timer.")}
            </p>

            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/20">
              <div
                style={{ width: `${progress}%` }}
                className="h-full rounded-full bg-primary-foreground/80 transition-all duration-500"
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={toggleRun}
                className="press flex size-14 items-center justify-center rounded-full bg-background text-primary transition-transform duration-200 hover:scale-105"
                aria-label={running ? t("Pause session") : t("Start session")}
              >
                {running ? <Pause className="size-6" /> : <Play className="size-6" />}
              </button>
              <button
                aria-label={t("Reset session")}
                onClick={() => {
                  setSeconds(total);
                  setRunning(false);
                  setDone(false);
                }}
                className="press transition-transform duration-200 hover:scale-110"
              >
                <RotateCcw className="size-6" />
              </button>
              <button
                onClick={() => setCustomOpen(true)}
                className="press flex items-center gap-2 rounded-xl border border-primary-foreground/25 px-3 py-2 text-sm font-semibold transition-colors hover:bg-primary-foreground/10"
              >
                <Timer className="size-4" />
                {t("Custom duration")}
              </button>
              <p className="text-sm opacity-85">
                {done
                  ? t("Session complete. Nicely done.")
                  : running
                    ? t("Room is focusing. Notifications muted.")
                    : t("Waiting to start.")}
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setJoined((j) => !j);
                setStatus(joined ? "offline" : "available");
              }}
              className={cn(
                "press flex items-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all duration-200 hover:-translate-y-0.5",
                joined
                  ? "border border-border hover:bg-accent"
                  : "bg-primary text-primary-foreground hover:opacity-90",
              )}
            >
              {joined ? <LogOut className="size-4" /> : <LogIn className="size-4" />}
              {t(joined ? "Leave room" : "Join room")}
            </button>
            <span className="text-sm text-muted-foreground">
              {t(joined ? "You joined the room." : "You are not in the room.")}
            </span>
          </div>

          <div className="mt-7">
            <p className="eyebrow">{t("Your status")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {participantStatuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={cn(
                    "press flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 sm:px-4",
                    status === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
                  )}
                >
                  <Circle className={cn("size-3 fill-current", statusToken[s])} />
                  {t(participantStatusLabel[s])}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-6">
          <section className="card-surface animate-fade-in p-4 sm:p-7">
            <div className="flex items-center gap-3">
              <UserPlus className="size-5 text-primary" />
              <h2 className="text-xl font-bold">{t("Invite friends")}</h2>
            </div>
            <p className="mt-3 text-muted-foreground">
              {t("Share this room code. Anyone with it joins your synced timer.")}
            </p>
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-3">
              <Link2 className="size-4 shrink-0 text-muted-foreground" />
              <span dir="ltr" className="min-w-0 flex-1 truncate font-mono text-lg font-bold tracking-wider">
                {inviteCode}
              </span>
              <button
                onClick={copy}
                aria-label={t("Copy invite code")}
                className="press shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
              </button>
            </div>
            <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
              {t("No chat, ever. Focus rooms stay silent by design.")}
            </p>
          </section>

          <section className="card-surface animate-fade-in p-4 sm:p-7">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="truncate text-xl font-bold">{t("Participants")}</h2>
              <button
                onClick={() => {
                  setName("");
                  setNameError("");
                  setAddOpen(true);
                }}
                className="press flex shrink-0 items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent"
              >
                <UserPlus className="size-4" />
                <span className="hidden sm:inline">{t("Add participant")}</span>
              </button>
            </div>

            {participants.length === 0 ? (
              <p className="mt-5 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                {t("No participants yet. Add someone to focus with.")}
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {participants.map((p, i) => (
                  <li
                    key={p.id}
                    style={{ animationDelay: `${i * 50}ms` }}
                    className="animate-fade-in flex items-center gap-3 rounded-2xl px-2 py-3 transition-colors hover:bg-muted/60 sm:px-3"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                      {initialsOf(p.name) || "?"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{p.name}</p>
                      <p className={cn("flex items-center gap-1.5 text-sm", statusToken[p.status])}>
                        <Circle className="size-2.5 fill-current" />
                        {t(participantStatusLabel[p.status])}
                        {p.inRoom ? ` · ${t("Join room")}` : ""}
                      </p>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          style={{ width: `${p.status === "focus" ? progress : 0}%` }}
                          className="h-full rounded-full bg-primary transition-all duration-700"
                        />
                      </div>
                    </div>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {p.streak}
                      {t("d streak")}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label={t("Participant actions")}
                        className="press shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <MoreVertical className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setProfile(p)}>{t("View profile")}</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            updateParticipant(p.id, { inRoom: true, status: running ? "focus" : "available" });
                            setInvited(p.id);
                            window.setTimeout(() => setInvited(null), 1600);
                          }}
                        >
                          {invited === p.id ? t("Invited") : t("Invite to focus session")}
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => setPendingRemove(p)}>
                          {t("Remove participant")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* custom duration */}
      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("Custom duration")}</DialogTitle>
            <DialogDescription>{t("Set your own focus length.")}</DialogDescription>
          </DialogHeader>
          <form
            className="grid grid-cols-3 gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              applyCustom();
            }}
          >
            {(
              [
                ["Hours", ch, setCh],
                ["Minutes", cm, setCm],
                ["Seconds", cs, setCs],
              ] as const
            ).map(([label, val, set]) => (
              <label key={label} className="block">
                <span className="eyebrow">{t(label)}</span>
                <input
                  type="number"
                  min={0}
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 outline-none transition-colors focus:border-primary"
                />
              </label>
            ))}
            <button type="submit" className="hidden" />
          </form>
          {customError ? <p className="text-sm font-medium text-destructive">{customError}</p> : null}
          <DialogFooter>
            <button
              type="button"
              onClick={() => setCustomOpen(false)}
              className="press rounded-xl border border-border px-5 py-3 font-semibold transition-colors hover:bg-muted"
            >
              {t("Cancel")}
            </button>
            <button
              type="button"
              onClick={applyCustom}
              className="press rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t("Use duration")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* add participant */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("Add participant")}</DialogTitle>
            <DialogDescription>{t("Add someone to your focus room.")}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) {
                setNameError(t("Enter a name."));
                return;
              }
              addParticipant(name);
              setAddOpen(false);
            }}
          >
            <label className="block">
              <span className="eyebrow">{t("Participant name")}</span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-muted/40 px-4 py-3 outline-none transition-colors focus:border-primary"
              />
            </label>
            {nameError ? <p className="mt-2 text-sm font-medium text-destructive">{nameError}</p> : null}
            <DialogFooter className="mt-5">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="press rounded-xl border border-border px-5 py-3 font-semibold transition-colors hover:bg-muted"
              >
                {t("Cancel")}
              </button>
              <button
                type="submit"
                className="press rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {t("Add participant")}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* profile */}
      <Dialog open={profile !== null} onOpenChange={(o) => !o && setProfile(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("Profile")}</DialogTitle>
            <DialogDescription>{profile?.name}</DialogDescription>
          </DialogHeader>
          {profile ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                <span className="text-muted-foreground">{t("Status")}</span>
                <span className={cn("font-semibold", statusToken[profile.status])}>
                  {t(participantStatusLabel[profile.status])}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                <span className="text-muted-foreground">{t("Streak")}</span>
                <span className="font-semibold tabular-nums">{profile.streak}</span>
              </div>
              <div>
                <p className="eyebrow">{t("Status")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {participantStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        updateParticipant(profile.id, { status: s });
                        setProfile({ ...profile, status: s });
                      }}
                      className={cn(
                        "press rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                        profile.status === s ? "border-primary text-primary" : "border-border text-muted-foreground",
                      )}
                    >
                      {t(participantStatusLabel[s])}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <button
              type="button"
              onClick={() => setProfile(null)}
              className="press rounded-xl border border-border px-5 py-3 font-semibold transition-colors hover:bg-muted"
            >
              {t("Close")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* remove confirmation */}
      <Dialog open={pendingRemove !== null} onOpenChange={(o) => !o && setPendingRemove(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("Remove this participant?")}</DialogTitle>
            <DialogDescription>
              {t("They will be removed from your focus room. This cannot be undone.")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setPendingRemove(null)}
              className="press rounded-xl border border-border px-5 py-3 font-semibold transition-colors hover:bg-muted"
            >
              {t("Cancel")}
            </button>
            <button
              type="button"
              onClick={() => {
                if (pendingRemove) removeParticipant(pendingRemove.id);
                setPendingRemove(null);
              }}
              className="press rounded-xl bg-destructive px-5 py-3 font-semibold text-destructive-foreground transition-opacity hover:opacity-90"
            >
              {t("Remove")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
