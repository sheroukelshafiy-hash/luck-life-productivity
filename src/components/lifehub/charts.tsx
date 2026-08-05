import { useState } from "react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const palette = [
  "var(--primary)",
  "oklch(0.667 0.11 175)",
  "oklch(0.62 0.14 300)",
  "oklch(0.65 0.16 20)",
  "oklch(0.63 0.13 250)",
  "oklch(0.72 0.13 120)",
  "oklch(0.75 0.14 70)",
  "oklch(0.60 0.05 240)",
];

export function sliceColor(i: number) {
  return palette[i % palette.length]!;
}

/** Animated donut chart for spending by category. */
export function CategoryPie({
  data,
  currency = "$",
  size = 220,
}: {
  data: { category: string; amount: number }[];
  currency?: string;
  size?: number;
}) {
  const t = useT();
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((a, b) => a + b.amount, 0);

  if (!total) {
    return (
      <div className="flex h-56 animate-fade-in flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
        <p className="font-semibold">{t("No spending yet")}</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          {t("Add a transaction and your breakdown will appear here.")}
        </p>
      </div>
    );
  }

  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-8">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {data.map((d, i) => {
            const frac = d.amount / total;
            const dash = c * frac;
            const el = (
              <circle
                key={d.category}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={sliceColor(i)}
                strokeWidth={hover === i ? 28 : 22}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
                className="transition-all duration-500"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tabular-nums">
            {currency}
            {(hover === null ? total : data[hover]!.amount).toFixed(0)}
          </span>
          <span className="max-w-24 truncate text-sm text-muted-foreground">
            {hover === null ? t("Total") : t(data[hover]!.category)}
          </span>
        </div>
      </div>

      <ul className="min-w-40 flex-1 space-y-2">
        {data.map((d, i) => (
          <li
            key={d.category}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 transition-colors",
              hover === i && "bg-muted/60",
            )}
          >
            <span className="size-3 rounded-full" style={{ background: sliceColor(i) }} />
            <span className="flex-1 truncate">{t(d.category)}</span>
            <span className="tabular-nums text-muted-foreground">
              {Math.round((d.amount / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Grouped bars: monthly trend / income vs expenses. */
export function BarChart({
  data,
  currency = "$",
  series = ["expense"],
}: {
  data: { label: string; expense: number; income: number }[];
  currency?: string;
  series?: ("expense" | "income")[];
}) {
  const t = useT();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(
    1,
    ...data.flatMap((d) => series.map((s) => (s === "income" ? d.income : d.expense))),
  );

  return (
    <div>
      <div className="flex h-56 items-end gap-3">
        {data.map((d, i) => (
          <div
            key={d.label}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className="relative flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            {hover === i ? (
              <div className="absolute -top-2 z-10 -translate-y-full whitespace-nowrap rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
                {series.map((s) => (
                  <p key={s} className="tabular-nums">
                    {t(s === "income" ? "Income" : "Expenses")}: {currency}
                    {(s === "income" ? d.income : d.expense).toFixed(0)}
                  </p>
                ))}
              </div>
            ) : null}
            <div className="flex min-h-0 w-full flex-1 items-end justify-center gap-1">
              {series.map((s) => {
                const v = s === "income" ? d.income : d.expense;
                return (
                  <div
                    key={s}
                    style={{ height: `${(v / max) * 100}%` }}
                    className={cn(
                      "w-full max-w-8 origin-bottom animate-fade-in rounded-t-lg transition-all duration-500",
                      s === "income" ? "bg-success/70" : "bg-primary/80",
                      hover === i && "opacity-100",
                      hover !== null && hover !== i && "opacity-60",
                    )}
                  />
                );
              })}
            </div>
            <span className="text-xs text-muted-foreground">{t(d.label)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
        {series.map((s) => (
          <span key={s} className="flex items-center gap-2">
            <span className={cn("size-3 rounded-full", s === "income" ? "bg-success/70" : "bg-primary/80")} />
            {t(s === "income" ? "Income" : "Expenses")}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Planned vs actual budget bar. */
export function BudgetMeter({
  planned,
  actual,
  currency = "$",
}: {
  planned: number;
  actual: number;
  currency?: string;
}) {
  const t = useT();
  const pct = planned > 0 ? Math.min(100, (actual / planned) * 100) : 0;
  const over = planned > 0 && actual > planned;
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="text-3xl font-bold tabular-nums">
          {currency}
          {actual.toFixed(0)}
        </p>
        <p className="text-muted-foreground">
          {t("of")} {currency}
          {planned.toFixed(0)} {t("planned")}
        </p>
      </div>
      <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-muted">
        <div
          style={{ width: `${pct}%` }}
          className={cn("h-full rounded-full transition-all duration-700", over ? "bg-destructive" : "bg-primary")}
        />
      </div>
      <p className={cn("mt-2 text-sm", over ? "text-destructive" : "text-muted-foreground")}>
        {over
          ? `${t("Over budget by")} ${currency}${(actual - planned).toFixed(0)}`
          : `${currency}${(planned - actual).toFixed(0)} ${t("left this month")}`}
      </p>
    </div>
  );
}
