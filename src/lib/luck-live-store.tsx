import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Priority = "high" | "medium" | "low";

export type Task = {
  id: string;
  title: string;
  project: string;
  priority: Priority;
  due: string;
  done: boolean;
  /** ISO yyyy-mm-dd date the task is scheduled for */
  date?: string;
  description?: string;
  reminder?: string;
  estimate?: number;
  notes?: string;
  tags?: string[];
  archived?: boolean;
};

export function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayISO() {
  return toISODate(new Date());
}

export function dueLabel(iso: string) {
  const today = todayISO();
  if (iso === today) return "Today";
  const t = new Date();
  t.setDate(t.getDate() + 1);
  if (iso === toISODate(t)) return "Tomorrow";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const defaultTasks: Task[] = [
  { id: "t1", title: "Draft the weekly product update", project: "Personal", priority: "high", due: "Today", done: false },
  { id: "t2", title: "Finalize Q3 launch brief", project: "Product launch", priority: "high", due: "Today", done: false },
  { id: "t3", title: "Reply to design review notes", project: "Team ops", priority: "medium", due: "Today", done: false },
  { id: "t4", title: "Refine onboarding checklist", project: "Growth sprint", priority: "medium", due: "Today", done: false },
];


export type Settings = {
  theme: "dark" | "light" | "system";
  accent: "gold" | "teal";
  fontSize: "small" | "medium" | "large";
  focusDuration: number;
  language: "en" | "ar";
  timerSounds: boolean;
  sessionAlerts: boolean;
  streakReminders: boolean;
  // General
  displayName: string;
  startPage: "/" | "/tasks" | "/calendar" | "/insights";
  weekStart: "sunday" | "monday";
  compactMode: boolean;
  // Notifications
  taskReminders: boolean;
  pomodoroNotifications: boolean;
  dailySummary: boolean;
  achievementAlerts: boolean;
  weeklyReview: boolean;
  // Productivity
  shortBreak: number;
  longBreak: number;
  autoStartBreak: boolean;
  autoStartNext: boolean;
  soundVolume: number;
  focusSound: "none" | "rain" | "cafe" | "waves" | "white-noise";
  timerAnimation: boolean;
  // Privacy
  analyticsOptIn: boolean;
  crashReports: boolean;
  showProfilePublicly: boolean;
};

const defaultSettings: Settings = {
  theme: "dark",
  accent: "gold",
  fontSize: "medium",
  focusDuration: 26,
  language: "en",
  timerSounds: true,
  sessionAlerts: true,
  streakReminders: false,
  displayName: "Luck Live user",
  startPage: "/",
  weekStart: "monday",
  compactMode: false,
  taskReminders: true,
  pomodoroNotifications: true,
  dailySummary: true,
  achievementAlerts: true,
  weeklyReview: false,
  shortBreak: 5,
  longBreak: 15,
  autoStartBreak: true,
  autoStartNext: false,
  soundVolume: 60,
  focusSound: "none",
  timerAnimation: true,
  analyticsOptIn: true,
  crashReports: true,
  showProfilePublicly: false,
};


export type TaskDialogState = {
  open: boolean;
  taskId?: string | null;
  date?: string | null;
};

type Store = {
  tasks: Task[];
  allTasks: Task[];
  settings: Settings;
  toggleTask: (id: string) => void;
  addTask: (task: Omit<Task, "id" | "done"> & { done?: boolean }) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  duplicateTask: (id: string) => void;
  archiveTask: (id: string, archived?: boolean) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  completion: number;
  taskDialog: TaskDialogState;
  openTaskDialog: (opts?: { taskId?: string; date?: string }) => void;
  closeTaskDialog: () => void;
};

const StoreContext = createContext<Store | null>(null);

const KEY = "luck-live-state-v1";

export function LuckLiveProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [taskDialog, setTaskDialog] = useState<TaskDialogState>({ open: false });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { tasks?: Task[]; settings?: Settings };
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.settings) setSettings({ ...defaultSettings, ...parsed.settings });
      }
    } catch {
      /* ignore corrupted state */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ tasks, settings }));
    } catch {
      /* storage unavailable */
    }
  }, [tasks, settings]);

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = settings.theme === "system" ? mq.matches : settings.theme === "dark";
      root.classList.toggle("dark", dark);
    };
    apply();
    mq.addEventListener("change", apply);
    root.style.fontSize =
      settings.fontSize === "small" ? "15px" : settings.fontSize === "large" ? "18px" : "16px";
    root.dir = settings.language === "ar" ? "rtl" : "ltr";
    root.lang = settings.language;
    if (settings.accent === "teal") {
      root.style.setProperty("--primary", "oklch(0.667 0.11 175)");
      root.style.setProperty("--ring", "oklch(0.667 0.11 175)");
    } else {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--ring");
    }
    return () => mq.removeEventListener("change", apply);
  }, [settings.theme, settings.fontSize, settings.language, settings.accent]);


  const value = useMemo<Store>(() => {
    const visible = tasks.filter((t) => !t.archived);
    const done = visible.filter((t) => t.done).length;
    return {
      tasks: visible,
      allTasks: tasks,
      settings,
      completion: visible.length ? Math.round((done / visible.length) * 100) : 0,
      toggleTask: (id) =>
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))),
      addTask: (task) =>
        setTasks((prev) => [
          ...prev,
          { done: false, ...task, id: crypto.randomUUID() },
        ]),
      updateTask: (id, patch) =>
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
      deleteTask: (id) => setTasks((prev) => prev.filter((t) => t.id !== id)),
      duplicateTask: (id) =>
        setTasks((prev) => {
          const src = prev.find((t) => t.id === id);
          if (!src) return prev;
          return [...prev, { ...src, id: crypto.randomUUID(), title: `${src.title} (copy)`, done: false }];
        }),
      archiveTask: (id, archived = true) =>
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, archived } : t))),
      updateSettings: (patch) => setSettings((prev) => ({ ...prev, ...patch })),
      taskDialog,
      openTaskDialog: (opts) =>
        setTaskDialog({ open: true, taskId: opts?.taskId ?? null, date: opts?.date ?? null }),
      closeTaskDialog: () => setTaskDialog({ open: false }),
    };
  }, [tasks, settings, taskDialog]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useLuckLive() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useLuckLive must be used inside LuckLiveProvider");
  return ctx;
}
