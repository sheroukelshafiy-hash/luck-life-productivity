import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/lib/i18n";
import { todayISO } from "@/lib/luck-live-store";
import {
  expenseCategories,
  incomeCategories,
  useLifeHub,
  type TxKind,
} from "@/lib/life-hub-store";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

export function TransactionDialog() {
  const { txDialog, closeTxDialog, transactions, addTransaction, updateTransaction, deleteTransaction } =
    useLifeHub();
  const t = useT();
  const editing = txDialog.id ? transactions.find((x) => x.id === txDialog.id) : undefined;

  const [kind, setKind] = useState<TxKind>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!txDialog.open) return;
    setError("");
    const k = editing?.kind ?? txDialog.kind ?? "expense";
    setKind(k);
    setAmount(editing ? String(editing.amount) : "");
    setCategory(editing?.category ?? (k === "income" ? "Salary" : "Food"));
    setDate(editing?.date ?? todayISO());
    setNotes(editing?.notes ?? "");
  }, [txDialog.open, txDialog.id, txDialog.kind, editing]);

  const categories = kind === "income" ? incomeCategories : expenseCategories;

  const submit = () => {
    const value = Number(amount);
    if (!amount || Number.isNaN(value) || value <= 0) {
      setError(t("Enter an amount greater than zero."));
      return;
    }
    const payload = { kind, amount: value, category, date, notes: notes.trim() };
    if (editing) updateTransaction(editing.id, payload);
    else addTransaction(payload);
    closeTxDialog();
  };

  return (
    <Dialog open={txDialog.open} onOpenChange={(o) => (o ? null : closeTxDialog())}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && (e.target as HTMLElement).tagName !== "TEXTAREA") {
            e.preventDefault();
            submit();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{editing ? t("Transaction details") : t("New transaction")}</DialogTitle>
          <DialogDescription>{t("Track what comes in and what goes out.")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/50 p-1.5">
            {(["expense", "income"] as TxKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setKind(k);
                  setCategory(k === "income" ? "Salary" : "Food");
                }}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                  kind === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(k === "income" ? "Income" : "Expense")}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="eyebrow">{t("Amount")}</label>
              <input
                autoFocus
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={cn(field, "mt-2")}
              />
            </div>
            <div>
              <label className="eyebrow">{t("Date")}</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={cn(field, "mt-2")} />
            </div>
          </div>

          <div>
            <p className="eyebrow">{t("Category")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "press rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5",
                    category === c
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {t(c)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="eyebrow">{t("Notes")}</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={cn(field, "mt-2 resize-none")}
            />
          </div>

          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="gap-2">
          {editing ? (
            <button
              onClick={() => {
                deleteTransaction(editing.id);
                closeTxDialog();
              }}
              className="press me-auto rounded-xl border border-border px-4 py-3 font-semibold text-destructive transition-colors hover:bg-destructive/10"
            >
              {t("Delete")}
            </button>
          ) : null}
          <button
            onClick={closeTxDialog}
            className="press rounded-xl border border-border px-4 py-3 font-semibold transition-colors hover:bg-accent"
          >
            {t("Cancel")}
          </button>
          <button
            onClick={submit}
            className="press rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
          >
            {editing ? t("Save changes") : t("Add transaction")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
