import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Plus, Pencil } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TransactionDialog } from "@/components/lifehub/TransactionDialog";
import { BarChart, BudgetMeter, CategoryPie } from "@/components/lifehub/charts";
import { CountUp } from "@/components/luck/widgets";
import { useT, useLocale } from "@/lib/i18n";
import { useToday } from "@/lib/use-now";
import { useBudgetSummary, useLifeHub, useMonthlyTrend } from "@/lib/life-hub-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/budget")({
  head: () => ({
    meta: [
      { title: "Budget — Luck Life personal finance" },
      {
        name: "description",
        content: "Track income, expenses and monthly budget with animated spending analytics.",
      },
      { property: "og:title", content: "Budget — Luck Life personal finance" },
      {
        property: "og:description",
        content: "Income, expenses, category breakdown and planned vs actual spending.",
      },
    ],
  }),
  component: BudgetPage,
});

function BudgetPage() {
  const t = useT();
  const locale = useLocale();
  const now = useToday();
  const { transactions, openTxDialog, symbol: currency, monthlyBudget, setMonthlyBudget } = useLifeHub();
  const summary = useBudgetSummary(now);
  const trend = useMonthlyTrend(now);
  const [budgetDraft, setBudgetDraft] = useState("");

  const recent = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12),
    [transactions],
  );

  const stats = [
    { label: "Today's spending", value: summary.todaySpending, tone: "expense" },
    { label: "Weekly spending", value: summary.weekSpending, tone: "expense" },
    { label: "Monthly spending", value: summary.monthlyExpenses, tone: "expense" },
    { label: "Remaining budget", value: summary.remaining, tone: summary.remaining < 0 ? "over" : "ok" },
    { label: "Monthly income", value: summary.monthlyIncome, tone: "income" },
    { label: "Monthly expenses", value: summary.monthlyExpenses, tone: "expense" },
  ] as const;

  return (
    <AppShell
      breadcrumb="Budget"
      eyebrow="Life Hub / Budget"
      title="Money, calmly tracked."
      subtitle="See where every unit goes and how the month is really trending."
    >
      <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center">
        <button
          onClick={() => openTxDialog({ kind: "expense" })}
          className="press flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
        >
          <Plus className="size-5" />
          {t("Add expense")}
        </button>
        <button
          onClick={() => openTxDialog({ kind: "income" })}
          className="press flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent"
        >
          <ArrowUpRight className="size-5 text-success" />
          {t("Add income")}
        </button>
        <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-border bg-card p-1.5 sm:ms-auto">
          <span className="ps-2 text-sm text-muted-foreground">{t("Currency")}</span>
          {currencies.map((c) => (
            <button
              key={c.code}
              onClick={() => setCurrency(c.code)}
              className={cn(
                "press rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200",
                currencyCode === c.code
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {c.symbol} {c.code}
            </button>
          ))}
        </div>
      </div>


      <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s, i) => (
          <section
            key={s.label}
            style={{ animationDelay: `${i * 60}ms` }}
            className="card-surface lift animate-fade-in p-6"
          >
            <p className="eyebrow">{t(s.label)}</p>
            <p
              className={cn(
                "mt-3 text-4xl font-bold",
                s.tone === "income" ? "text-success" : s.tone === "over" ? "text-destructive" : "text-primary",
              )}
            >
              {currency}
              <CountUp value={Math.abs(s.value)} decimals={0} />
            </p>
          </section>
        ))}
      </div>

      <section className="card-surface lift mt-6 p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">{t("Planned vs actual")}</p>
            <h2 className="mt-2 text-2xl font-bold">{t("Monthly budget")}</h2>
          </div>
          <div className="flex items-center gap-2">
            <input
              inputMode="decimal"
              value={budgetDraft}
              onChange={(e) => setBudgetDraft(e.target.value)}
              placeholder={String(monthlyBudget)}
              className="w-32 rounded-xl border border-border bg-muted/40 px-4 py-3 outline-none transition-colors focus:border-primary"
            />
            <button
              onClick={() => {
                const v = Number(budgetDraft);
                if (!Number.isNaN(v) && v > 0) setMonthlyBudget(v);
                setBudgetDraft("");
              }}
              className="press flex items-center gap-2 rounded-xl bg-muted px-4 py-3 font-semibold transition-colors hover:bg-accent"
            >
              <Pencil className="size-4" />
              {t("Set budget")}
            </button>
          </div>
        </div>
        <div className="mt-6">
          <BudgetMeter planned={summary.monthlyBudget} actual={summary.monthlyExpenses} currency={currency} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="card-surface lift p-7">
          <p className="eyebrow">{t("Breakdown")}</p>
          <h2 className="mt-2 mb-6 text-2xl font-bold">{t("Spending by category")}</h2>
          <CategoryPie data={summary.byCategory} currency={currency} />
        </section>
        <section className="card-surface lift p-7">
          <p className="eyebrow">{t("Trend")}</p>
          <h2 className="mt-2 mb-6 text-2xl font-bold">{t("Monthly spending trend")}</h2>
          <BarChart data={trend} currency={currency} series={["expense"]} />
        </section>
      </div>

      <section className="card-surface lift mt-6 p-7">
        <p className="eyebrow">{t("Balance")}</p>
        <h2 className="mt-2 mb-6 text-2xl font-bold">{t("Income vs expenses")}</h2>
        <BarChart data={trend} currency={currency} series={["income", "expense"]} />
      </section>

      <section className="card-surface lift mt-6 p-7">
        <p className="eyebrow">{t("History")}</p>
        <h2 className="mt-2 mb-4 text-2xl font-bold">{t("Recent transactions")}</h2>
        {recent.length ? (
          <ul className="divide-y divide-border">
            {recent.map((x) => (
              <li key={x.id}>
                <button
                  onClick={() => openTxDialog({ id: x.id })}
                  className="flex w-full items-center gap-4 rounded-xl px-2 py-4 text-start transition-colors hover:bg-muted/60"
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      x.kind === "income" ? "bg-success/15 text-success" : "bg-primary/15 text-primary",
                    )}
                  >
                    {x.kind === "income" ? (
                      <ArrowUpRight className="size-5" />
                    ) : (
                      <ArrowDownRight className="size-5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{t(x.category)}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {new Date(`${x.date}T00:00:00`).toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric",
                      })}
                      {x.notes ? ` · ${x.notes}` : ""}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 font-semibold tabular-nums",
                      x.kind === "income" ? "text-success" : "text-foreground",
                    )}
                  >
                    {x.kind === "income" ? "+" : "−"}
                    {currency}
                    {x.amount.toFixed(0)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            {t("No transactions yet.")}
          </p>
        )}
      </section>

      <TransactionDialog />
    </AppShell>
  );
}
