import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toISODate, todayISO } from "@/lib/luck-live-store";

export type AppointmentType =
  | "meeting"
  | "class"
  | "doctor"
  | "travel"
  | "personal"
  | "custom";

export const appointmentTypes: AppointmentType[] = [
  "meeting",
  "class",
  "doctor",
  "travel",
  "personal",
  "custom",
];

export const appointmentTypeLabel: Record<AppointmentType, string> = {
  meeting: "Meeting",
  class: "Class",
  doctor: "Doctor appointment",
  travel: "Travel",
  personal: "Personal event",
  custom: "Custom",
};

/** Color labels are design-system aware CSS colors, not hardcoded hexes in components. */
export const colorLabels = [
  { id: "gold", token: "var(--primary)" },
  { id: "teal", token: "oklch(0.667 0.11 175)" },
  { id: "violet", token: "oklch(0.62 0.14 300)" },
  { id: "rose", token: "oklch(0.65 0.16 20)" },
  { id: "green", token: "var(--success, oklch(0.68 0.14 150))" },
  { id: "blue", token: "oklch(0.63 0.13 250)" },
] as const;

export type ColorLabel = (typeof colorLabels)[number]["id"];

export function colorFor(id: string | undefined) {
  return colorLabels.find((c) => c.id === id)?.token ?? "var(--primary)";
}

export type Appointment = {
  id: string;
  title: string;
  type: AppointmentType;
  category: string;
  date: string; // yyyy-mm-dd
  start: string; // HH:MM
  end: string; // HH:MM
  location?: string;
  notes?: string;
  reminder?: string;
  color: ColorLabel;
};

export type TxKind = "income" | "expense";

export const incomeCategories = ["Salary", "Freelance", "Other"];
export const expenseCategories = [
  "Food",
  "Transportation",
  "Shopping",
  "Education",
  "Bills",
  "Health",
  "Entertainment",
  "Other",
];

export type Transaction = {
  id: string;
  kind: TxKind;
  amount: number;
  category: string;
  date: string;
  notes?: string;
};

/** Supported currencies for every financial surface. */
export const currencies = [
  { code: "EGP", symbol: "E£", label: "Egyptian Pound" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
] as const;

export type CurrencyCode = (typeof currencies)[number]["code"];

export function currencySymbol(code: string) {
  return currencies.find((c) => c.code === code)?.symbol ?? "$";
}

/** Older builds stored a raw symbol — normalise it to a currency code. */
function normalizeCurrency(v: string | undefined): CurrencyCode {
  if (!v) return "USD";
  const byCode = currencies.find((c) => c.code === v);
  if (byCode) return byCode.code;
  const bySymbol = currencies.find((c) => c.symbol === v);
  return bySymbol?.code ?? "USD";
}

/** One hour-slot activity in the daily planner. */
export type TimeBlock = {
  id: string;
  date: string; // yyyy-mm-dd
  start: string; // HH:MM
  end: string; // HH:MM
  title: string;
  notes?: string;
  color: ColorLabel;
  done?: boolean;
};

/** Focus Together participant — stored locally, no demo users. */
export type ParticipantStatus = "available" | "focus" | "break" | "busy" | "offline";

export const participantStatuses: ParticipantStatus[] = [
  "available",
  "focus",
  "break",
  "busy",
  "offline",
];

export const participantStatusLabel: Record<ParticipantStatus, string> = {
  available: "Available",
  focus: "In Focus",
  break: "Break",
  busy: "Busy",
  offline: "Offline",
};

export type Participant = {
  id: string;
  name: string;
  status: ParticipantStatus;
  streak: number;
  inRoom: boolean;
};

export function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export type AppointmentDialogState = { open: boolean; id?: string | null; date?: string | null };
export type TxDialogState = { open: boolean; id?: string | null; kind?: TxKind };

type LifeHub = {
  appointments: Appointment[];
  transactions: Transaction[];
  timeBlocks: TimeBlock[];
  participants: Participant[];
  monthlyBudget: number;
  currency: CurrencyCode;
  symbol: string;
  setMonthlyBudget: (v: number) => void;
  setCurrency: (v: CurrencyCode) => void;
  addAppointment: (a: Omit<Appointment, "id">) => void;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addTimeBlock: (b: Omit<TimeBlock, "id">) => void;
  updateTimeBlock: (id: string, patch: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  addParticipant: (name: string) => void;
  updateParticipant: (id: string, patch: Partial<Participant>) => void;
  removeParticipant: (id: string) => void;
  appointmentDialog: AppointmentDialogState;
  openAppointmentDialog: (opts?: { id?: string; date?: string }) => void;
  closeAppointmentDialog: () => void;
  txDialog: TxDialogState;
  openTxDialog: (opts?: { id?: string; kind?: TxKind }) => void;
  closeTxDialog: () => void;
};

const KEY = "luck-life-hub-v1";

const Ctx = createContext<LifeHub | null>(null);


const seedAppointments: Appointment[] = [
  {
    id: "a1",
    title: "Product sync",
    type: "meeting",
    category: "Work",
    date: todayISO(),
    start: "10:00",
    end: "11:00",
    location: "Google Meet",
    notes: "Bring the launch brief.",
    reminder: "15",
    color: "gold",
  },
  {
    id: "a2",
    title: "Dentist",
    type: "doctor",
    category: "Health",
    date: todayISO(),
    start: "17:30",
    end: "18:15",
    location: "Nile Clinic",
    reminder: "60",
    color: "rose",
  },
];

const seedTransactions: Transaction[] = [
  { id: "x1", kind: "income", amount: 2400, category: "Salary", date: todayISO(), notes: "Monthly payroll" },
  { id: "x2", kind: "expense", amount: 42, category: "Food", date: todayISO() },
  { id: "x3", kind: "expense", amount: 18, category: "Transportation", date: todayISO() },
];

export function LifeHubProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(seedAppointments);
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState(1500);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [appointmentDialog, setAppointmentDialog] = useState<AppointmentDialogState>({ open: false });
  const [txDialog, setTxDialog] = useState<TxDialogState>({ open: false });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<{
        appointments: Appointment[];
        transactions: Transaction[];
        timeBlocks: TimeBlock[];
        participants: Participant[];
        monthlyBudget: number;
        currency: string;
      }>;
      if (parsed.appointments) setAppointments(parsed.appointments);
      if (parsed.transactions) setTransactions(parsed.transactions);
      if (parsed.timeBlocks) setTimeBlocks(parsed.timeBlocks);
      if (parsed.participants) setParticipants(parsed.participants);
      if (typeof parsed.monthlyBudget === "number") setMonthlyBudget(parsed.monthlyBudget);
      if (parsed.currency) setCurrency(normalizeCurrency(parsed.currency));
    } catch {
      /* ignore corrupted state */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        KEY,
        JSON.stringify({ appointments, transactions, timeBlocks, participants, monthlyBudget, currency }),
      );
    } catch {
      /* storage unavailable */
    }
  }, [appointments, transactions, timeBlocks, participants, monthlyBudget, currency]);

  const value = useMemo<LifeHub>(
    () => ({
      appointments,
      transactions,
      timeBlocks,
      participants,
      monthlyBudget,
      currency,
      symbol: currencySymbol(currency),
      setMonthlyBudget,
      setCurrency,
      addAppointment: (a) => setAppointments((prev) => [...prev, { ...a, id: crypto.randomUUID() }]),
      updateAppointment: (id, patch) =>
        setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a))),
      deleteAppointment: (id) => setAppointments((prev) => prev.filter((a) => a.id !== id)),
      addTransaction: (tx) => setTransactions((prev) => [...prev, { ...tx, id: crypto.randomUUID() }]),
      updateTransaction: (id, patch) =>
        setTransactions((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x))),
      deleteTransaction: (id) => setTransactions((prev) => prev.filter((x) => x.id !== id)),
      addTimeBlock: (b) => setTimeBlocks((prev) => [...prev, { ...b, id: crypto.randomUUID() }]),
      updateTimeBlock: (id, patch) =>
        setTimeBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b))),
      deleteTimeBlock: (id) => setTimeBlocks((prev) => prev.filter((b) => b.id !== id)),
      addParticipant: (name) =>
        setParticipants((prev) => [
          ...prev,
          { id: crypto.randomUUID(), name: name.trim(), status: "available", streak: 0, inRoom: false },
        ]),
      updateParticipant: (id, patch) =>
        setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
      removeParticipant: (id) => setParticipants((prev) => prev.filter((p) => p.id !== id)),
      appointmentDialog,
      openAppointmentDialog: (opts) =>
        setAppointmentDialog({ open: true, id: opts?.id ?? null, date: opts?.date ?? null }),
      closeAppointmentDialog: () => setAppointmentDialog({ open: false }),
      txDialog,
      openTxDialog: (opts) => setTxDialog({ open: true, id: opts?.id ?? null, kind: opts?.kind ?? "expense" }),
      closeTxDialog: () => setTxDialog({ open: false }),
    }),
    [
      appointments,
      transactions,
      timeBlocks,
      participants,
      monthlyBudget,
      currency,
      appointmentDialog,
      txDialog,
    ],
  );


  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLifeHub() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLifeHub must be used inside LifeHubProvider");
  return ctx;
}

/* ---------- derived helpers ---------- */

export function startOfWeek(d: Date, weekStartsMonday = true) {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = weekStartsMonday ? (day === 0 ? -6 : 1 - day) : -day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function weekDates(d: Date, weekStartsMonday = true) {
  const start = startOfWeek(d, weekStartsMonday);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
}

export function useBudgetSummary(now: Date) {
  const { transactions, monthlyBudget } = useLifeHub();
  return useMemo(() => {
    const today = toISODate(now);
    const week = weekDates(now).map(toISODate);
    const monthPrefix = today.slice(0, 7);

    const expenses = transactions.filter((t) => t.kind === "expense");
    const income = transactions.filter((t) => t.kind === "income");

    const sum = (list: Transaction[]) => list.reduce((a, b) => a + b.amount, 0);

    const monthlyExpenses = sum(expenses.filter((t) => t.date.startsWith(monthPrefix)));
    const monthlyIncome = sum(income.filter((t) => t.date.startsWith(monthPrefix)));

    const byCategory = new Map<string, number>();
    for (const t of expenses.filter((t) => t.date.startsWith(monthPrefix))) {
      byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);
    }

    return {
      todaySpending: sum(expenses.filter((t) => t.date === today)),
      weekSpending: sum(expenses.filter((t) => week.includes(t.date))),
      monthlyExpenses,
      monthlyIncome,
      remaining: monthlyBudget - monthlyExpenses,
      monthlyBudget,
      byCategory: [...byCategory.entries()]
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount),
    };
  }, [transactions, monthlyBudget, now]);
}

/** Last 6 months of spend, oldest first. */
export function useMonthlyTrend(now: Date) {
  const { transactions } = useLifeHub();
  return useMemo(() => {
    const out: { key: string; label: string; expense: number; income: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short" });
      const inMonth = transactions.filter((t) => t.date.startsWith(key));
      out.push({
        key,
        label,
        expense: inMonth.filter((t) => t.kind === "expense").reduce((a, b) => a + b.amount, 0),
        income: inMonth.filter((t) => t.kind === "income").reduce((a, b) => a + b.amount, 0),
      });
    }
    return out;
  }, [transactions, now]);
}
