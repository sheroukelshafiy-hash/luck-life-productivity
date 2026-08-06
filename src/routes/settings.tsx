import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Check,
  SlidersHorizontal,
  Palette,
  Languages,
  Bell,
  Timer,
  UserRound,
  Lock,
  Info,
  Monitor,
  Moon,
  Sun,
  LogOut,
  Download,
  Trash2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useLuckLive, type Settings } from "@/lib/luck-live-store";
import { currencies, useLifeHub, type CurrencyCode } from "@/lib/life-hub-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Luck Life preferences" },
      {
        name: "description",
        content:
          "Tune general, appearance, language, notification, productivity, account and privacy preferences in Luck Life.",
      },
      { property: "og:title", content: "Settings — Luck Life preferences" },
      {
        property: "og:description",
        content: "Tune appearance, language, notifications and focus preferences in Luck Life.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const sections = [
  { id: "general", en: "General", ar: "عام", icon: SlidersHorizontal },
  { id: "appearance", en: "Appearance", ar: "المظهر", icon: Palette },
  { id: "language", en: "Language", ar: "اللغة", icon: Languages },
  { id: "notifications", en: "Notifications", ar: "الإشعارات", icon: Bell },
  { id: "productivity", en: "Productivity", ar: "الإنتاجية", icon: Timer },
  { id: "account", en: "Account", ar: "الحساب", icon: UserRound },
  { id: "privacy", en: "Privacy", ar: "الخصوصية", icon: Lock },
  { id: "about", en: "About", ar: "حول", icon: Info },
] as const;

type SectionId = (typeof sections)[number]["id"];

/* ---------- premium primitives ---------- */

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-8 w-14 shrink-0 rounded-full border transition-all duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        on
          ? "border-primary bg-primary shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
          : "border-border bg-muted hover:bg-muted/70",
      )}
    >
      <span
        className={cn(
          "absolute top-1 size-6 rounded-full bg-background shadow-sm transition-all duration-300 ease-out",
          on ? "start-7 scale-100" : "start-1 scale-95",
        )}
      />
    </button>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string; icon?: typeof Sun }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-2xl bg-muted p-1">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
              active
                ? "bg-card text-primary shadow-card"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.icon ? <o.icon className="size-4" /> : null}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Stepper({
  value,
  onChange,
  min = 1,
  max = 180,
  suffix = "min",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-muted p-1">
      <button
        onClick={() => onChange(clamp(value - 1))}
        aria-label="Decrease"
        className="size-9 rounded-xl text-lg font-bold transition-colors hover:bg-card hover:text-primary"
      >
        −
      </button>
      <span className="min-w-16 text-center text-lg font-semibold tabular-nums">
        {value}
        <span className="ms-1 text-sm text-muted-foreground">{suffix}</span>
      </span>
      <button
        onClick={() => onChange(clamp(value + 1))}
        aria-label="Increase"
        className="size-9 rounded-xl text-lg font-bold transition-colors hover:bg-card hover:text-primary"
      >
        +
      </button>
    </div>
  );
}

function Select<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="rounded-xl border border-border bg-muted px-4 py-3 font-medium outline-none transition-colors hover:border-primary focus:border-primary"
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Row({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border-b border-border px-2 py-5 transition-colors last:border-0 hover:bg-muted/40">
      <div className="min-w-0">
        <p className="font-semibold transition-colors group-hover:text-primary">{title}</p>
        <p className="mt-1 text-muted-foreground">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function Card({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section key={title} className="card-surface animate-fade-in p-7">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-lg text-muted-foreground">{intro}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* ---------- page ---------- */

function SettingsPage() {
  const { settings, updateSettings } = useLuckLive();
  const { currency, setCurrency, symbol } = useLifeHub();
  const [active, setActive] = useState<SectionId>("general");
  const ar = settings.language === "ar";
  const set = (patch: Partial<Settings>) => updateSettings(patch);

  return (
    <AppShell
      breadcrumb="Settings"
      eyebrow="Workspace / Settings"
      title="Settings"
      subtitle="Make Luck Life fit the way you work."
    >
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <nav className="card-surface flex flex-row gap-2 overflow-x-auto p-3 lg:flex-col lg:p-4">
          {sections.map((s) => {
            const on = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "group flex min-w-44 items-center gap-3 rounded-2xl px-4 py-3.5 text-start transition-all duration-200 lg:min-w-0",
                  on
                    ? "bg-muted text-primary shadow-card"
                    : "text-foreground hover:bg-muted/60 hover:ps-5",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                    on ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  <s.icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold">{ar ? s.ar : s.en}</span>
                  <span className="block text-sm opacity-70">{ar ? s.en : s.ar}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="min-w-0">
          {active === "general" && (
            <Card
              eyebrow="General"
              title="General preferences"
              intro="The basics that shape every session."
            >
              <Row title="Display name" desc="Shown across your workspace.">
                <input
                  value={settings.displayName}
                  onChange={(e) => set({ displayName: e.target.value })}
                  aria-label="Display name"
                  className="w-56 rounded-xl border border-border bg-muted px-4 py-3 font-medium outline-none transition-colors focus:border-primary"
                />
              </Row>
              <Row title="Start page" desc="Where Luck Life opens each morning.">
                <Select
                  label="Start page"
                  value={settings.startPage}
                  onChange={(v) => set({ startPage: v })}
                  options={[
                    { id: "/", label: "Overview" },
                    { id: "/tasks", label: "My tasks" },
                    { id: "/calendar", label: "Calendar" },
                    { id: "/insights", label: "Insights" },
                  ]}
                />
              </Row>
              <Row title="Week starts on" desc="Applies to calendar and weekly review.">
                <Segmented
                  value={settings.weekStart}
                  onChange={(v) => set({ weekStart: v })}
                  options={[
                    { id: "monday", label: "Monday" },
                    { id: "sunday", label: "Sunday" },
                  ]}
                />
              </Row>
              <Row title="Currency" desc="Used across Budget and every financial view.">
                <div className="flex items-center gap-3">
                  <Segmented
                    value={currency}
                    onChange={(v) => setCurrency(v as CurrencyCode)}
                    options={currencies.map((c) => ({ id: c.code, label: `${c.symbol} ${c.code}` }))}
                  />
                  <span className="rounded-xl bg-muted px-3 py-2 text-sm font-semibold text-primary">
                    {symbol}
                  </span>
                </div>
              </Row>
              <Row title="Compact mode" desc="Tighter density for smaller screens.">
                <Toggle
                  label="Compact mode"
                  on={settings.compactMode}
                  onChange={(v) => set({ compactMode: v })}
                />
              </Row>

            </Card>
          )}

          {active === "appearance" && (
            <Card
              eyebrow="Appearance"
              title="Preferences"
              intro="Shape the visual rhythm of Luck Life."
            >
              <Row title="Theme" desc="System follows your device, dark stays petroleum.">
                <Segmented
                  value={settings.theme}
                  onChange={(v) => set({ theme: v })}
                  options={[
                    { id: "system", label: "System", icon: Monitor },
                    { id: "dark", label: "Dark", icon: Moon },
                    { id: "light", label: "Light", icon: Sun },
                  ]}
                />
              </Row>
              <Row title="Accent color" desc="Choose the active highlight color.">
                <div className="flex flex-wrap gap-3">
                  {(
                    [
                      { id: "gold", title: "Warm gold", note: "Premium and focused." },
                      { id: "teal", title: "Quiet teal", note: "Calm and understated." },
                    ] as const
                  ).map((a) => (
                    <button
                      key={a.id}
                      onClick={() => set({ accent: a.id })}
                      className={cn(
                        "w-48 rounded-2xl border p-4 text-start transition-all duration-200 hover:-translate-y-0.5",
                        settings.accent === a.id
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border hover:border-primary/60",
                      )}
                    >
                      <span className="flex items-center justify-between font-semibold">
                        {a.title}
                        {settings.accent === a.id ? <Check className="size-4" /> : null}
                      </span>
                      <span className="mt-1 block text-sm opacity-80">{a.note}</span>
                    </button>
                  ))}
                </div>
              </Row>
              <Row title="Font size" desc="Resize the entire interface.">
                <Segmented
                  value={settings.fontSize}
                  onChange={(v) => set({ fontSize: v })}
                  options={[
                    { id: "small", label: "Small" },
                    { id: "medium", label: "Medium" },
                    { id: "large", label: "Large" },
                  ]}
                />
              </Row>
              <Row title="Default focus duration" desc="Loads automatically when the app opens.">
                <Stepper
                  value={settings.focusDuration}
                  min={5}
                  max={120}
                  onChange={(v) => set({ focusDuration: v })}
                />
              </Row>
            </Card>
          )}

          {active === "language" && (
            <Card
              eyebrow="Language"
              title="Language and direction"
              intro="Switch instantly — layout direction follows the language."
            >
              <Row title="Primary language" desc="Choose Arabic or English.">
                <Segmented
                  value={settings.language}
                  onChange={(v) => set({ language: v })}
                  options={[
                    { id: "en", label: "English" },
                    { id: "ar", label: "العربية" },
                  ]}
                />
              </Row>
              <Row title="Direction" desc="RTL follows Arabic automatically.">
                <span className="rounded-xl bg-muted px-4 py-2 font-bold text-primary">
                  {ar ? "RTL" : "LTR"}
                </span>
              </Row>
              <Row
                title="Localization coverage"
                desc="More strings are translated with every release."
              >
                <div className="w-56">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[62%] rounded-full bg-primary transition-all duration-700" />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">62% translated</p>
                </div>
              </Row>
              <p className="pt-6 text-lg">LTR · Luck Life · مرحبا بك · RTL</p>
            </Card>
          )}

          {active === "notifications" && (
            <Card
              eyebrow="Notifications"
              title="Notification preferences"
              intro="Choose how Luck Life keeps you gently on track."
            >
              {(
                [
                  ["taskReminders", "Task reminders", "Nudges before a task is due."],
                  ["pomodoroNotifications", "Pomodoro notifications", "Alerts when a focus block or break ends."],
                  ["dailySummary", "Daily summary", "A short recap of what you finished."],
                  ["achievementAlerts", "Achievement notifications", "Celebrate streaks and milestones."],
                  ["weeklyReview", "Weekly review", "A Sunday look back at your momentum."],
                  ["timerSounds", "Timer sounds", "Play a soft cue when a session ends."],
                  ["sessionAlerts", "Session alerts", "Get a nudge before your next focus block."],
                  ["streakReminders", "Daily streak reminders", "Keep your streak visible each morning."],
                ] as const
              ).map(([key, title, desc]) => (
                <Row key={key} title={title} desc={desc}>
                  <Toggle
                    label={title}
                    on={settings[key]}
                    onChange={(v) => set({ [key]: v } as Partial<Settings>)}
                  />
                </Row>
              ))}
              <Row title="Browser notifications" desc="Allow Luck Life to notify you outside the tab.">
                <button
                  onClick={() => void Notification?.requestPermission?.()}
                  className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
                >
                  Allow
                </button>
              </Row>
            </Card>
          )}

          {active === "productivity" && (
            <Card
              eyebrow="Productivity"
              title="Focus and Pomodoro"
              intro="Tune the rhythm of your deep work sessions."
            >
              <Row title="Default Pomodoro duration" desc="Length of one focus block.">
                <Stepper
                  value={settings.focusDuration}
                  min={5}
                  max={120}
                  onChange={(v) => set({ focusDuration: v })}
                />
              </Row>
              <Row title="Short break" desc="Breather between focus blocks.">
                <Stepper
                  value={settings.shortBreak}
                  min={1}
                  max={30}
                  onChange={(v) => set({ shortBreak: v })}
                />
              </Row>
              <Row title="Long break" desc="After four completed sessions.">
                <Stepper
                  value={settings.longBreak}
                  min={5}
                  max={60}
                  onChange={(v) => set({ longBreak: v })}
                />
              </Row>
              <Row title="Auto-start break" desc="Roll into the break without a click.">
                <Toggle
                  label="Auto-start break"
                  on={settings.autoStartBreak}
                  onChange={(v) => set({ autoStartBreak: v })}
                />
              </Row>
              <Row title="Auto-start next session" desc="Chain sessions for long stretches.">
                <Toggle
                  label="Auto-start next session"
                  on={settings.autoStartNext}
                  onChange={(v) => set({ autoStartNext: v })}
                />
              </Row>
              <Row title="Sound volume" desc="Applies to cues and focus sounds.">
                <div className="flex w-56 items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    aria-label="Sound volume"
                    value={settings.soundVolume}
                    onChange={(e) => set({ soundVolume: Number(e.target.value) })}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
                  />
                  <span className="w-10 text-end font-semibold tabular-nums">
                    {settings.soundVolume}
                  </span>
                </div>
              </Row>
              <Row title="Focus sound" desc="Ambient background while the timer runs.">
                <Select
                  label="Focus sound"
                  value={settings.focusSound}
                  onChange={(v) => set({ focusSound: v })}
                  options={[
                    { id: "none", label: "None" },
                    { id: "rain", label: "Rain" },
                    { id: "cafe", label: "Café" },
                    { id: "waves", label: "Waves" },
                    { id: "white-noise", label: "White noise" },
                  ]}
                />
              </Row>
              <Row title="Timer animation" desc="Animate the progress ring while focusing.">
                <Toggle
                  label="Timer animation"
                  on={settings.timerAnimation}
                  onChange={(v) => set({ timerAnimation: v })}
                />
              </Row>
            </Card>
          )}

          {active === "account" && (
            <Card
              eyebrow="Account"
              title="Your account"
              intro="Profile details and workspace ownership."
            >
              <div className="mb-2 flex items-center gap-4 rounded-2xl bg-muted/50 p-5">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-xl font-bold text-primary">
                  {settings.displayName.trim().charAt(0).toUpperCase() || "L"}
                </span>
                <div className="min-w-0">
                  <p className="text-lg font-bold">{settings.displayName || "Luck Life user"}</p>
                  <p className="text-muted-foreground">Personal workspace · Pro plan</p>
                </div>
              </div>
              <Row title="Email" desc="Used for summaries and account recovery.">
                <span className="font-medium text-muted-foreground">you@lucklife.app</span>
              </Row>
              <Row title="Plan" desc="Pro — renews August 2, 2027.">
                <span className="rounded-full bg-primary/15 px-4 py-2 text-sm font-semibold text-primary">
                  Pro
                </span>
              </Row>
              <Row title="Export data" desc="Download your tasks and settings as JSON.">
                <button className="flex items-center gap-2 rounded-xl border border-border px-5 py-3 font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary">
                  <Download className="size-4" />
                  Export
                </button>
              </Row>
              <Row title="Sign out" desc="End this session on the current device.">
                <button className="flex items-center gap-2 rounded-xl border border-border px-5 py-3 font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary">
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </Row>
              <Row title="Delete account" desc="Permanently remove your workspace.">
                <button className="flex items-center gap-2 rounded-xl border border-destructive/50 px-5 py-3 font-semibold text-destructive transition-all duration-200 hover:-translate-y-0.5 hover:bg-destructive/10">
                  <Trash2 className="size-4" />
                  Delete
                </button>
              </Row>
            </Card>
          )}

          {active === "privacy" && (
            <Card
              eyebrow="Privacy"
              title="Privacy and data"
              intro="You decide what Luck Life keeps and shares."
            >
              <Row title="Product analytics" desc="Anonymous usage signals that guide the roadmap.">
                <Toggle
                  label="Product analytics"
                  on={settings.analyticsOptIn}
                  onChange={(v) => set({ analyticsOptIn: v })}
                />
              </Row>
              <Row title="Crash reports" desc="Send diagnostics when something breaks.">
                <Toggle
                  label="Crash reports"
                  on={settings.crashReports}
                  onChange={(v) => set({ crashReports: v })}
                />
              </Row>
              <Row title="Public profile" desc="Let teammates see your name and streak.">
                <Toggle
                  label="Public profile"
                  on={settings.showProfilePublicly}
                  onChange={(v) => set({ showProfilePublicly: v })}
                />
              </Row>
              <Row title="Local storage" desc="Your tasks and preferences stay on this device.">
                <span className="rounded-full bg-success/15 px-4 py-2 text-sm font-semibold text-success">
                  On-device
                </span>
              </Row>
            </Card>
          )}

          {active === "about" && (
            <Card
              eyebrow="About"
              title="Luck Life"
              intro="An intelligent productivity platform for focused, long-term progress."
            >
              <Row title="Version" desc="Stable · Production channel.">
                <span className="font-semibold">2.4.0</span>
              </Row>
              <Row title="Build" desc="Released August 2, 2026.">
                <span className="font-semibold tabular-nums">20260802.1148</span>
              </Row>
              <Row title="Developer" desc="Luck Labs — calm software for daily work.">
                <a
                  href="mailto:support@lucklife.app"
                  className="rounded-xl border border-border px-5 py-3 font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                >
                  Contact
                </a>
              </Row>
              <Row title="Full about page" desc="Roadmap, acknowledgements and contact links.">
                <Link
                  to="/about"
                  className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
                >
                  Open About
                </Link>
              </Row>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
