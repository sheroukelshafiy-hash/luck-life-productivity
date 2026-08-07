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
import { colorLabels, colorFor, useLifeHub, type ColorLabel, type TimeBlock } from "@/lib/life-hub-store";
import { useT } from "@/lib/i18n";
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
  const { timeBlocks, addTimeBlock, updateTimeBlock, deleteTimeBlock } = useLifeHub();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");

  const byHour = useMemo(() => {
    const map = new Map<number, TimeBlock[]>();
    for (const b of timeBlocks.filter((x) => x.date === date)) {
      const h = Number(b.start.slice(0, 2));
      map.set(h, [...(map.get(h) ?? []), b]);
    }
    for (const list of map.values()) list.sort((a, b) => a.start.localeCompare(b.start));
    return map;
  }, [timeBlocks, date]);

  const planned = [...byHour.values()].flat().length;

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

      <div className="overflow-hidden rounded-2xl border border-border">
        {HOURS.map((h) => {
          const list = byHour.get(h) ?? [];
          return (
            <div
              key={h}
              className="flex items-stretch gap-3 border-b border-border last:border-0 transition-colors hover:bg-muted/40"
            >
              <div className="w-24 shrink-0 border-e border-border px-3 py-4 text-sm tabular-nums text-muted-foreground sm:w-32">
                <span className="block font-semibold text-foreground">{hourLabel(h)}</span>
                <span className="block">{hourLabel(h + 1)}</span>
              </div>
              <div className="min-w-0 flex-1 py-2.5 pe-2.5">
                {list.length === 0 ? (
                  <button
                    onClick={() => setDraft(emptyDraft(h))}
                    className="flex h-full min-h-12 w-full items-center gap-2 rounded-xl px-3 text-start text-sm text-muted-foreground opacity-0 transition-opacity duration-200 hover:opacity-100 focus:opacity-100"
                  >
                    <Plus className="size-4" />
                    {t("Add activity")}
                  </button>
                ) : (
                  <div className="space-y-2">
                    {list.map((b) => (
                      <div
                        key={b.id}
                        style={{ borderInlineStartColor: colorFor(b.color) }}
                        className="animate-fade-in flex items-center gap-3 rounded-xl border border-border border-s-4 bg-muted/50 px-3 py-2.5"
                      >
                        <button
                          aria-label={t("Toggle done")}
                          onClick={() => updateTimeBlock(b.id, { done: !b.done })}
                          className={cn(
                            "press flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
                            b.done ? "border-primary bg-primary text-primary-foreground" : "border-border",
                          )}
                        >
                          {b.done ? <Check className="size-3" /> : null}
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
                              "block truncate font-semibold",
                              b.done && "text-muted-foreground line-through",
                            )}
                          >
                            {b.title}
                          </span>
                          <span className="block truncate text-sm text-muted-foreground">
                            {b.start} – {b.end}
                            {b.notes ? ` · ${b.notes}` : ""}
                          </span>
                        </button>
                        <button
                          aria-label={t("Delete")}
                          onClick={() => deleteTimeBlock(b.id)}
                          className="press rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
