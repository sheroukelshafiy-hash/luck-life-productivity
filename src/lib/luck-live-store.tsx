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
};

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


type Store = {
  tasks: Task[];
  settings: Settings;
  toggleTask: (id: string) => void;
  addTask: (task: Omit<Task, "id" | "done">) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  completion: number;
};

const StoreContext = createContext<Store | null>(null);

const KEY = "luck-live-state-v1";

export function LuckLiveProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

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
    const done = tasks.filter((t) => t.done).length;
    return {
      tasks,
      settings,
      completion: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
      toggleTask: (id) =>
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))),
      addTask: (task) =>
        setTasks((prev) => [...prev, { ...task, id: crypto.randomUUID(), done: false }]),
      updateSettings: (patch) => setSettings((prev) => ({ ...prev, ...patch })),
    };
  }, [tasks, settings]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useLuckLive() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useLuckLive must be used inside LuckLiveProvider");
  return ctx;
}
