import { useMemo, useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { colorLabels, colorFor, useLifeHub, type ColorLabel } from "@/lib/life-hub-store";
import { useT, useFormatTime } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const START_HOUR = 6;
const END_HOUR = 23; // exclusive edge — last row is 22:00 → 23:00
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
const ROW = 64; // px per hour — blocks span proportionally

const pad = (n: number) => String(n).padStart(2, "0");
const hourLabel = (h: number) => `${pad(h)}:00`;
const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map((n) => Number(n));
  return (h ?? 0) * 60 + (m ?? 0);
};


type Draft = {
  id?: string;
  title: string;
  start: string;
  end: string;
  notes: string;
  color: ColorLabel;
};

function emptyDraft(hour: number): Draft {
  return {
    title: "",
    start: hourLabel(hour),
    end: hourLabel(Math.min(23, hour + 1)),
    notes: "",
    color: "gold",
  };
}

/** Premium hour-by-hour daily planner for a single date. */
export function DayTimeline({ date }: { date: string }) {
  const t = useT();
  const fmt = useFormatTime();
  const { timeBlocks, addTimeBlock, updateTimeBlock, deleteTimeBlock } = useLifeHub();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");

  /** Blocks laid out by real duration, with side-by-side lanes when they overlap. */
  const { placed, lanes } = useMemo(() => {
    const items = timeBlocks
      .filter((x) => x.date === date)
      .map((b) => {
        const s = toMinutes(b.start);
        return { b, s, e: Math.max(toMinutes(b.end), s + 15) };
      })
      .sort((a, z) => a.s - z.s || a.e - z.e);

    const laneEnds: number[] = [];
    const out = items.map((it) => {
      let col = laneEnds.findIndex((end) => end <= it.s);
      if (col === -1) {
        col = laneEnds.length;
        laneEnds.push(it.e);
      } else {
        laneEnds[col] = it.e;
      }
      return { ...it, col };
    });
    return { placed: out, lanes: Math.max(1, laneEnds.length) };
  }, [timeBlocks, date]);

  const planned = placed.length;


  const save = () => {
    if (!draft) return;
    if (!draft.title.trim()) {
      setError(t("Give this activity a title."));
      return;
    }
    if (draft.end <= draft.start) {
      setError(t("End time must be after the start time."));
      return;
    }
    setError("");
    const payload = {
      date,
      title: draft.title.trim(),
      start: draft.start,
      end: draft.end,
      notes: draft.notes.trim(),
      color: draft.color,
    };
    if (draft.id) updateTimeBlock(draft.id, payload);
    else addTimeBlock(payload);
    setDraft(null);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground">
          {planned} {t("activities planned")}
        </p>
        <button
          onClick={() => setDraft(emptyDraft(9))}
          className="press flex items-center gap-2 rounded-xl bg-muted px-4 py-2.5 font-semibold transition-colors hover:bg-accent"
        >
          <Plus className="size-4" />
          {t("Add activity")}
        </button>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border">
        {HOURS.map((h) => (
          <button
            key={h}
            style={{ height: ROW }}
            onClick={() => setDraft(emptyDraft(h))}
            className="flex w-full items-stretch border-b border-border text-start transition-colors last:border-0 hover:bg-muted/40"
          >
            <span className="flex w-20 shrink-0 flex-col justify-center border-e border-border px-2 text-xs tabular-nums text-muted-foreground sm:w-28 sm:px-3 sm:text-sm">
              <span className="block font-semibold text-foreground">{fmt(hourLabel(h))}</span>
            </span>
            <span className="min-w-0 flex-1" />
          </button>
        ))}

        {/* activity layer — height and position follow the real duration */}
        <div className="pointer-events-none absolute inset-y-0 end-0 start-20 sm:start-28">
          <div className="relative h-full px-1.5 py-0.5">
            {placed.map(({ b, s, e, col }) => {
              const top = ((Math.max(s, START_HOUR * 60) - START_HOUR * 60) / 60) * ROW;
              const height = Math.max(
                26,
                ((Math.min(e, END_HOUR * 60) - Math.max(s, START_HOUR * 60)) / 60) * ROW - 4,
              );
              return (
                <div
                  key={b.id}
                  style={{
                    top,
                    height,
                    insetInlineStart: `${(col * 100) / lanes}%`,
                    width: `${100 / lanes}%`,
                    borderInlineStartColor: colorFor(b.color),
                  }}
                  className="animate-fade-in pointer-events-auto absolute flex gap-2 overflow-hidden rounded-xl border border-border border-s-4 bg-card/95 px-2 py-1.5 shadow-card backdrop-blur-sm"
                >
                  <button
                    aria-label={t("Toggle done")}
                    onClick={() => updateTimeBlock(b.id, { done: !b.done })}
                    className={cn(
                      "press mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border-2 transition-all",
                      b.done ? "border-primary bg-primary text-primary-foreground" : "border-border",
                    )}
                  >
                    {b.done ? <Check className="size-2.5" /> : null}
                  </button>
                  <button
                    onClick={() =>
                      setDraft({
                        id: b.id,
                        title: b.title,
                        start: b.start,
                        end: b.end,
                        notes: b.notes ?? "",
                        color: b.color,
                      })
                    }
                    className="min-w-0 flex-1 text-start"
                  >
                    <span
                      className={cn(
                        "block truncate text-sm font-semibold",
                        b.done && "text-muted-foreground line-through",
                      )}
                    >
                      {b.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {fmt(b.start)} – {fmt(b.end)}
                      {b.notes ? ` · ${b.notes}` : ""}
                    </span>
                  </button>
                  <button
                    aria-label={t("Delete")}
                    onClick={() => deleteTimeBlock(b.id)}
                    className="press h-fit shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {planned === 0 ? (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          {t("Nothing planned yet. Tap any hour to add an activity.")}
        </p>
      ) : null}


      <Dialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{draft?.id ? t("Edit activity") : t("New activity")}</DialogTitle>
            <DialogDescription>{t("Give this hour a purpose.")}</DialogDescription>
          </DialogHeader>
          {draft ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <label className="block">
                <span className="eyebrow">{t("Title")}</span>
                <input
                  autoFocus
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-border bg-muted/40 px-4 py-3 outline-none transition-colors focus:border-primary"
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                {(
                  [
                    ["Start time", "start"],
                    ["End time", "end"],
                  ] as const
                ).map(([label, key]) => (
                  <label key={key} className="block">
                    <span className="eyebrow">{t(label)}</span>
                    <input
                      type="time"
                      value={draft[key]}
                      onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-border bg-muted/40 px-4 py-3 outline-none transition-colors focus:border-primary"
                    />
                  </label>
                ))}
              </div>
              <label className="block">
                <span className="eyebrow">{t("Notes")}</span>
                <textarea
                  rows={2}
                  value={draft.notes}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-border bg-muted/40 px-4 py-3 outline-none transition-colors focus:border-primary"
                />
              </label>
              <div>
                <span className="eyebrow">{t("Color label")}</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {colorLabels.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      aria-label={c.id}
                      onClick={() => setDraft({ ...draft, color: c.id })}
                      style={{ background: c.token }}
                      className={cn(
                        "size-8 rounded-full transition-transform duration-200 hover:scale-110",
                        draft.color === c.id && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                      )}
                    />
                  ))}
                </div>
              </div>
              <button type="submit" className="hidden" />
            </form>
          ) : null}
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <DialogFooter>
            {draft?.id ? (
              <button
                type="button"
                onClick={() => {
                  deleteTimeBlock(draft.id!);
                  setDraft(null);
                }}
                className="press me-auto rounded-xl border border-destructive/50 px-5 py-3 font-semibold text-destructive transition-colors hover:bg-destructive/10"
              >
                {t("Delete")}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="press rounded-xl border border-border px-5 py-3 font-semibold transition-colors hover:bg-muted"
            >
              {t("Cancel")}
            </button>
            <button
              type="button"
              onClick={save}
              className="press rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t("Save")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
