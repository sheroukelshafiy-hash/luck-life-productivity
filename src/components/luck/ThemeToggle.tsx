import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useLuckLive } from "@/lib/luck-live-store";
import { useT } from "@/lib/i18n";

/**
 * Header quick theme toggle. Reads and writes the same `settings.theme`
 * value the Appearance settings use, so both stay in sync.
 */
export function ThemeToggle() {
  const { settings, updateSettings } = useLuckLive();
  const t = useT();
  const [systemDark, setSystemDark] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setSystemDark(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const isDark = settings.theme === "system" ? systemDark : settings.theme === "dark";

  return (
    <button
      type="button"
      onClick={() => updateSettings({ theme: isDark ? "light" : "dark" })}
      aria-label={isDark ? t("Switch to light theme") : t("Switch to dark theme")}
      title={isDark ? t("Switch to light theme") : t("Switch to dark theme")}
      className="rounded-2xl border border-border bg-card p-3 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground active:translate-y-0"
    >
      <span className="relative block size-5">
        <Sun
          className={`absolute inset-0 size-5 transition-all duration-300 ${
            isDark ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
          }`}
        />
        <Moon
          className={`absolute inset-0 size-5 transition-all duration-300 ${
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
          }`}
        />
      </span>
    </button>
  );
}
