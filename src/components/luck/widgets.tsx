import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { useLuckLive, type Task } from "@/lib/luck-live-store";
import { TaskMenu } from "@/components/luck/TaskMenu";
import { useT } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** Smooth count-up for statistics. */
export function useCountUp(value: number, duration = 700) {
  const [shown, setShown] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = from + (value - from) * eased;
      setShown(next);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return shown;
}

export function CountUp({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const shown = useCountUp(value);
  return (
    <span className="tabular-nums">
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export function ProgressRing({ value, size = 176 }: { value: number; size?: number }) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const animated = useCountUp(value);
  const t = useT();
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="stroke-muted" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className="stroke-primary transition-[stroke-dashoffset] duration-500"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c - (c * animated) / 100}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums">{Math.round(animated)}%</span>
        <span className="text-sm text-muted-foreground">{t("complete")}</span>
      </div>
    </div>
  );
}

export function TaskRow({ task }: { task: Task }) {
  const { toggleTask, openTaskDialog } = useLuckLive();
  const t = useT();
  return (
    <div className="animate-task-in flex items-start gap-4 border-b border-border py-5 transition-colors last:border-0 hover:bg-muted/30">
      <button
        aria-label={task.done ? t("Mark as not done") : t("Mark as done")}
        onClick={() => toggleTask(task.id)}
        className={cn(
          "press mt-0.5 size-6 shrink-0 rounded-md border-2 transition-all duration-200",
          task.done ? "scale-105 border-primary bg-primary" : "border-border hover:border-primary",
        )}
      />
      <button
        type="button"
        onClick={() => openTaskDialog({ taskId: task.id })}
        className="min-w-0 flex-1 text-start"
      >
        <p
          className={cn(
            "font-semibold transition-all duration-300",
            task.done && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "rounded-lg px-3 py-1 text-sm font-medium capitalize transition-colors",
              task.priority === "high"
                ? "bg-primary/15 text-primary"
                : task.priority === "medium"
                  ? "bg-warning/15 text-warning"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {t(task.priority)}
          </span>
          <span className="text-base text-muted-foreground">{task.project}</span>
        </div>
      </button>
      <span className="shrink-0 text-base text-muted-foreground">{t(task.due)}</span>
      <TaskMenu task={task} />
    </div>
  );
}

const week = [
  { day: "Mon", value: 42 },
  { day: "Tue", value: 58 },
  { day: "Wed", value: 48 },
  { day: "Thu", value: 75 },
  { day: "Fri", value: 64 },
  { day: "Sat", value: 83 },
  { day: "Sun", value: 0 },
];

export function CompletionChart({ data = week }: { data?: { day: string; value: number }[] }) {
  const t = useT();
  const w = 640;
  const h = 260;
  const pad = 8;
  const [hover, setHover] = useState<number | null>(null);

  const empty = data.length === 0 || data.every((d) => d.value === 0);

  const points = data.map((d, i) => ({
    x: pad + (i * (w - pad * 2)) / Math.max(1, data.length - 1),
    y: h - (d.value / 100) * h,
  }));
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  if (empty) {
    return (
      <div className="flex h-56 animate-fade-in flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
        <p className="font-semibold">{t("No data yet")}</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          {t("Complete a few tasks and your momentum will appear here.")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-3">
        <div className="flex flex-col justify-between py-1 text-sm text-muted-foreground">
          {[100, 75, 50, 25, 0].map((v) => (
            <span key={v}>{v}%</span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full" preserveAspectRatio="none">
            {[0, 0.25, 0.5, 0.75, 1].map((v) => (
              <line
                key={v}
                x1="0"
                x2={w}
                y1={h * v}
                y2={h * v}
                className="stroke-border"
                strokeWidth="1.5"
              />
            ))}
            <path
              d={`${line} L${points[points.length - 1]!.x},${h} L${points[0]!.x},${h} Z`}
              className="animate-fade-in fill-primary/15"
            />
            <path
              d={line}
              className="chart-line stroke-primary transition-all duration-500"
              style={{ "--dash": 2200 } as React.CSSProperties}
              strokeWidth="4"
              fill="none"
              strokeLinejoin="round"
            />
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={hover === i ? 10 : 6}
                className="fill-foreground transition-all duration-200"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            ))}
            {points.map((p, i) => (
              <rect
                key={`hit-${i}`}
                x={p.x - 18}
                y={0}
                width={36}
                height={h}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            ))}
          </svg>

          {hover !== null ? (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 animate-fade-in rounded-xl border border-border bg-popover px-3 py-2 text-sm shadow-card"
              style={{
                left: `${(points[hover]!.x / w) * 100}%`,
                top: `${(points[hover]!.y / h) * 100 - 12}%`,
              }}
            >
              <span className="font-semibold">{t(data[hover]!.day)}</span>
              <span className="ms-2 text-muted-foreground">{data[hover]!.value}%</span>
            </div>
          ) : null}

          <div className="mt-2 flex justify-between text-sm text-muted-foreground">
            {data.map((d) => (
              <span key={d.day}>{t(d.day)}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** One flip-clock digit card with a realistic vertical flip. */
function FlipDigit({ value }: { value: string }) {
  const [prev, setPrev] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (value === prev) return;
    setFlipping(true);
    const id = window.setTimeout(() => {
      setPrev(value);
      setFlipping(false);
    }, 520);
    return () => window.clearTimeout(id);
  }, [value, prev]);

  return (
    <span className="flip-digit">
      {/* static halves */}
      <span className="flip-half top">
        <span>{flipping ? prev : value}</span>
      </span>
      <span className="flip-half bottom">
        <span>{prev}</span>
      </span>
      {flipping ? (
        <>
          <span className="flip-half top flip-anim-top">
            <span>{prev}</span>
          </span>
          <span className="flip-half bottom flip-anim-bottom">
            <span>{value}</span>
          </span>
        </>
      ) : null}
    </span>
  );
}

function FlipGroup({ value }: { value: string }) {
  return (
    <span className="flex gap-1">
      {value.split("").map((d, i) => (
        <FlipDigit key={i} value={d} />
      ))}
    </span>
  );
}

export function FlipClock({ hh, mm, ss }: { hh: string; mm: string; ss: string }) {
  return (
    <div className="mt-8 flex items-center gap-2 text-5xl font-extrabold tabular-nums sm:text-6xl">
      <FlipGroup value={hh} />
      <span className="pb-1 opacity-70">:</span>
      <FlipGroup value={mm} />
      <span className="pb-1 opacity-70">:</span>
      <FlipGroup value={ss} />
    </div>
  );
}

export function FocusSession() {
  const { settings } = useLuckLive();
  const t = useT();
  const [total, setTotal] = useState(settings.focusDuration * 60);
  const [seconds, setSeconds] = useState(settings.focusDuration * 60);
  const [running, setRunning] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [ch, setCh] = useState("0");
  const [cm, setCm] = useState("25");
  const [cs, setCs] = useState("0");
  const [customError, setCustomError] = useState("");
  const ref = useRef<number | null>(null);

  useEffect(() => {
    setTotal(settings.focusDuration * 60);
    setSeconds(settings.focusDuration * 60);
    setRunning(false);
  }, [settings.focusDuration]);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => {
      if (ref.current) window.clearInterval(ref.current);
    };
  }, [running]);

  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const presets = [15, 25, 30, 45, 60];
  const minutes = total / 60;

  const applyCustom = () => {
    const h = Number(ch);
    const m = Number(cm);
    const s = Number(cs);
    if ([h, m, s].some((n) => !Number.isFinite(n) || n < 0 || !Number.isInteger(n))) {
      setCustomError(t("Use whole, non-negative numbers."));
      return;
    }
    if (m > 59 || s > 59) {
      setCustomError(t("Minutes and seconds must be under 60."));
      return;
    }
    const totalSeconds = h * 3600 + m * 60 + s;
    if (totalSeconds < 1 || totalSeconds > 86400) {
      setCustomError(t("Pick a duration between 1 second and 24 hours."));
      return;
    }
    setCustomError("");
    setTotal(totalSeconds);
    setSeconds(totalSeconds);
    setRunning(false);
    setCustomOpen(false);
  };

  return (
    <section className="flex flex-col rounded-2xl bg-primary p-7 text-primary-foreground shadow-card">
      <p className="text-xs font-bold uppercase tracking-[0.12em] opacity-80">{t("Focus session")}</p>
      <h2 className="mt-2 text-2xl font-bold">{t("Ready when you are.")}</h2>
      <p className="mt-1 opacity-80">{t("Deep work, no distractions.")}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => {
              setTotal(p * 60);
              setSeconds(p * 60);
              setRunning(false);
            }}
            className={cn(
              "press rounded-xl border border-primary-foreground/25 px-4 py-2 font-medium transition-all duration-200 hover:bg-primary-foreground/10",
              minutes === p && "bg-primary-foreground/15",
            )}
          >
            {p}m
          </button>
        ))}
        <button
          onClick={() => setCustomOpen(true)}
          className={cn(
            "press rounded-xl border border-primary-foreground/25 px-4 py-2 font-medium transition-all duration-200 hover:bg-primary-foreground/10",
            !presets.includes(minutes) && "bg-primary-foreground/15",
          )}
        >
          {t("Custom")}
        </button>
      </div>

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
                  className="mt-2 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-base outline-none transition-colors focus:border-primary"
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

      <FlipClock hh={hh} mm={mm} ss={ss} />

      <div className="mt-6 flex items-center gap-5">
        <button
          onClick={() => setRunning((r) => !r)}
          aria-label={running ? t("Pause session") : t("Start session")}
          className="press flex size-14 items-center justify-center rounded-full bg-background text-primary transition-transform duration-200 hover:scale-105"
        >
          {running ? <Pause className="size-6" /> : <Play className="size-6" />}
        </button>
        <button
          aria-label={t("Reset session")}
          className="press transition-transform duration-200 hover:scale-110"
          onClick={() => {
            setSeconds(total);
            setRunning(false);
          }}
        >
          <RotateCcw className="size-6" />
        </button>
        <button
          aria-label={t("Skip session")}
          className="press transition-transform duration-200 hover:scale-110"
          onClick={() => {
            setSeconds(0);
            setRunning(false);
          }}
        >
          <SkipForward className="size-6" />
        </button>
      </div>
    </section>
  );
}
