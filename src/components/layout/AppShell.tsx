import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutGrid,
  CheckSquare,
  BarChart3,
  CalendarDays,
  Folder,
  Info,
  Settings2,
  Search,
  Plus,
  Menu,
  Sparkles,
  Sunrise,
  CalendarClock,
  Wallet,
} from "lucide-react";
import { useLuckLive } from "@/lib/luck-live-store";
import { TaskDialog } from "@/components/luck/TaskDialog";
import { NotificationCenter } from "@/components/luck/NotificationCenter";
import { ThemeToggle } from "@/components/luck/ThemeToggle";
import { useT, useLocale } from "@/lib/i18n";
import { useToday } from "@/lib/use-now";
import { cn } from "@/lib/utils";

const workspace = [
  { to: "/", label: "Overview", icon: LayoutGrid },
  { to: "/tasks", label: "My tasks", icon: CheckSquare, badge: true },
  { to: "/insights", label: "Insights", icon: BarChart3 },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
] as const;

const lifeHub = [
  { to: "/planner", label: "Planner", icon: CalendarClock },
  { to: "/budget", label: "Budget", icon: Wallet },
] as const;

const space = [
  { to: "/projects", label: "Projects", icon: Folder },
  { to: "/settings", label: "Settings", icon: Settings2 },
  { to: "/about", label: "About", icon: Info },
] as const;

/** Live, localized "today" label — never hardcoded. */
export function useTodayLabel() {
  const now = useToday();
  const locale = useLocale();
  return now.toLocaleDateString(locale, { weekday: "long", month: "short", day: "numeric" });
}

function NavList({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { tasks } = useLuckLive();
  const t = useT();
  const open = tasks.filter((x) => !x.done).length;

  const item = (
    to: string,
    label: string,
    Icon: typeof LayoutGrid,
    badge?: boolean,
  ) => {
    const active = pathname === to;
    return (
      <Link
        key={to}
        to={to}
        onClick={onNavigate}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50",
        )}
      >
        <Icon
          className={cn(
            "size-5 transition-transform duration-200 group-hover:scale-110",
            active ? "text-primary" : "text-muted-foreground",
          )}
        />
        <span className="flex-1">{t(label)}</span>
        {badge && open > 0 ? (
          <span className="text-sm font-semibold text-muted-foreground">{open}</span>
        ) : null}
      </Link>
    );
  };

  return (
    <nav className="flex flex-1 flex-col gap-8 overflow-y-auto px-3 py-4">
      <div className="space-y-1">
        <p className="eyebrow px-4 pb-2">{t("Workspace")}</p>
        {workspace.map((i) => item(i.to, i.label, i.icon, "badge" in i && i.badge))}
      </div>
      <div className="space-y-1">
        <p className="eyebrow flex items-center gap-1.5 px-4 pb-2">
          <Sparkles className="size-3.5 text-primary" />
          {t("Life Hub")}
        </p>
        {lifeHub.map((i) => item(i.to, i.label, i.icon))}
      </div>
      <div className="space-y-1">
        <p className="eyebrow px-4 pb-2">{t("Your space")}</p>
        {space.map((i) => item(i.to, i.label, i.icon))}
      </div>
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const t = useT();
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <Link to="/" onClick={onNavigate} className="group flex items-center gap-3 px-6 py-6">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-transform duration-200 group-hover:scale-105">
          <Sparkles className="size-6" />
        </span>
        <span className="text-2xl font-bold tracking-tight">{t("Luck Life")}</span>
      </Link>
      <NavList onNavigate={onNavigate} />
      <div className="flex items-center gap-3 border-t border-sidebar-border px-6 py-5">
        <span className="flex size-11 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
          SK
        </span>
        <div className="leading-tight">
          <p className="font-semibold">{t("Sherluck")}</p>
          <p className="text-sm text-muted-foreground">{t("Personal workspace")}</p>
        </div>
      </div>
    </div>
  );
}

export function AppShell({
  eyebrow,
  title,
  subtitle,
  breadcrumb,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  breadcrumb: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openTaskDialog } = useLuckLive();
  const t = useT();
  const today = useTodayLabel();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-background">
      <aside className="hidden w-72 shrink-0 border-e border-sidebar-border lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label={t("Close navigation")}
            className="absolute inset-0 animate-fade-in bg-background/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 start-0 w-72 animate-slide-in-right border-e border-sidebar-border">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-3 px-4 py-5 sm:px-6 lg:px-10">
          <button
            className="press rounded-xl border border-border bg-card p-2.5 transition-all duration-200 hover:-translate-y-0.5 lg:hidden"
            aria-label={t("Open navigation")}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </button>
          <div className="flex min-w-0 items-center gap-2 text-base">
            <Sunrise className="size-5 text-muted-foreground" />
            <span className="truncate text-muted-foreground">{today}</span>
            <span className="hidden font-semibold sm:inline">/ {t(breadcrumb)}</span>
          </div>
          <div className="ms-auto flex items-center gap-2 sm:gap-3">
            <label className="hidden items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-colors focus-within:border-primary md:flex">
              <Search className="size-4 text-muted-foreground" />
              <input
                placeholder={t("Search tasks")}
                className="w-40 bg-transparent text-base outline-none placeholder:text-muted-foreground lg:w-56"
              />
            </label>
            <ThemeToggle />
            <NotificationCenter />
            <button
              onClick={() => openTaskDialog()}
              className="press flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90">
              <Plus className="size-5" />
              <span className="hidden sm:inline">{t("Add task")}</span>
            </button>
          </div>
        </header>

        <main key={pathname} className="animate-page-in flex-1 px-4 pb-16 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-2 pt-4">
            <div className="min-w-0">
              <p className="eyebrow">{t(eyebrow)}</p>
              <h1 className="mt-2 text-4xl font-bold sm:text-5xl lg:text-6xl">{t(title)}</h1>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{t(subtitle)}</p>
            </div>
            <span className="text-base text-muted-foreground">{today}</span>
          </div>
          <div className="mt-8">{children}</div>
          <TaskDialog />
        </main>
      </div>
    </div>
  );
}
