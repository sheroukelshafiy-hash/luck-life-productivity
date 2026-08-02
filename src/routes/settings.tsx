import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useLuckLive } from "@/lib/luck-live-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Luck Live preferences" },
      { name: "description", content: "Theme, accent color, language, direction and notification preferences." },
      { property: "og:title", content: "Settings — Luck Live preferences" },
      { property: "og:description", content: "Theme, accent color, language, direction and notification preferences." },
    ],
  }),
  component: SettingsPage,
});

const sections = [
  { id: "appearance", en: "Appearance", ar: "المظهر" },
  { id: "language", en: "Language", ar: "اللغة" },
  { id: "notifications", en: "Notifications", ar: "الإشعارات" },
] as const;

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-8 w-14 shrink-0 rounded-full transition-colors",
        on ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "absolute top-1 size-6 rounded-full bg-background transition-all",
          on ? "start-7" : "start-1",
        )}
      />
    </button>
  );
}

function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-6 last:border-0">
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-muted-foreground">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function SettingsPage() {
  const { settings, updateSettings } = useLuckLive();
  const [active, setActive] = useState<(typeof sections)[number]["id"]>("appearance");

  return (
    <AppShell
      breadcrumb="Settings"
      eyebrow="Workspace / Settings"
      title="Settings"
      subtitle="Make Luck Live fit the way you work."
    >
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <nav className="card-surface flex flex-row gap-3 overflow-x-auto p-4 lg:flex-col lg:p-6">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={cn(
                "min-w-40 rounded-2xl px-5 py-6 text-start transition-colors lg:flex-1",
                active === s.id ? "bg-muted text-primary" : "hover:bg-muted/60",
              )}
            >
              <span className="block text-xl font-bold">{s.en}</span>
              <span className="block text-base opacity-80">{s.ar}</span>
            </button>
          ))}
        </nav>

        <section className="card-surface p-7">
          {active === "appearance" && (
            <>
              <p className="eyebrow">Appearance</p>
              <h2 className="mt-2 text-2xl font-bold">Preferences</h2>
              <p className="mt-3 text-lg">Shape the visual rhythm of Luck Live.</p>
              <div className="mt-6">
                <Row title="Theme" desc="Switch between warm light and petroleum dark mode.">
                  <Toggle
                    label="Dark theme"
                    on={settings.theme === "dark"}
                    onChange={(v) => updateSettings({ theme: v ? "dark" : "light" })}
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
                        onClick={() => updateSettings({ accent: a.id })}
                        className={cn(
                          "w-48 rounded-xl border p-4 text-start transition-colors",
                          settings.accent === a.id
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border",
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
                  <select
                    value={settings.fontSize}
                    onChange={(e) =>
                      updateSettings({ fontSize: e.target.value as typeof settings.fontSize })
                    }
                    className="rounded-xl bg-muted px-4 py-3 font-medium outline-none"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </Row>
                <Row title="Default focus duration" desc="Loads automatically when the app opens.">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={5}
                      max={120}
                      value={settings.focusDuration}
                      onChange={(e) =>
                        updateSettings({ focusDuration: Number(e.target.value) || 25 })
                      }
                      className="w-24 rounded-xl bg-muted px-4 py-3 text-lg font-semibold outline-none"
                    />
                    <span className="text-muted-foreground">min</span>
                  </div>
                </Row>
              </div>
            </>
          )}

          {active === "language" && (
            <>
              <p className="eyebrow">Language</p>
              <h2 className="mt-2 text-2xl font-bold">Language and direction</h2>
              <p className="mt-3 text-lg">
                The language setting updates every screen and switches the layout direction.
              </p>
              <div className="mt-6">
                <Row title="Primary language" desc="Choose Arabic or English.">
                  <select
                    value={settings.language}
                    onChange={(e) =>
                      updateSettings({ language: e.target.value as typeof settings.language })
                    }
                    className="rounded-xl bg-muted px-4 py-3 font-medium outline-none"
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </Row>
                <Row title="Direction" desc="RTL follows Arabic automatically.">
                  <span className="font-bold">{settings.language === "ar" ? "RTL" : "LTR"}</span>
                </Row>
                <p className="pt-6 text-lg">LTR · Luck Live · مرحبا بك · RTL</p>
              </div>
            </>
          )}

          {active === "notifications" && (
            <>
              <p className="eyebrow">Notifications</p>
              <h2 className="mt-2 text-2xl font-bold">Notification preferences</h2>
              <p className="mt-3 text-lg">Choose how Luck Live keeps you gently on track.</p>
              <div className="mt-6">
                <Row title="Timer sounds" desc="Play a soft cue when a focus session ends.">
                  <Toggle
                    label="Timer sounds"
                    on={settings.timerSounds}
                    onChange={(v) => updateSettings({ timerSounds: v })}
                  />
                </Row>
                <Row title="Session alerts" desc="Get a nudge before your next focus block.">
                  <Toggle
                    label="Session alerts"
                    on={settings.sessionAlerts}
                    onChange={(v) => updateSettings({ sessionAlerts: v })}
                  />
                </Row>
                <Row title="Daily streak reminders" desc="Keep your current streak visible each morning.">
                  <Toggle
                    label="Daily streak reminders"
                    on={settings.streakReminders}
                    onChange={(v) => updateSettings({ streakReminders: v })}
                  />
                </Row>
                <Row title="Browser notifications" desc="Allow Luck Live to notify you outside the tab.">
                  <button
                    onClick={() => void Notification?.requestPermission?.()}
                    className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Allow
                  </button>
                </Row>
              </div>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
