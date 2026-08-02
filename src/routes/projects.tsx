import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useLuckLive } from "@/lib/luck-live-store";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Luck Live" },
      { name: "description", content: "Group your work into projects and see progress per initiative." },
      { property: "og:title", content: "Projects — Luck Live" },
      { property: "og:description", content: "Group your work into projects and see progress per initiative." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { tasks } = useLuckLive();
  const projects = Array.from(new Set(tasks.map((t) => t.project)));

  return (
    <AppShell
      breadcrumb="Projects"
      eyebrow="Your space / Projects"
      title="Projects"
      subtitle="Every initiative you're moving forward, grouped in one place."
    >
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => {
          const items = tasks.filter((t) => t.project === p);
          const done = items.filter((t) => t.done).length;
          const pct = Math.round((done / items.length) * 100);
          return (
            <section key={p} className="card-surface p-6">
              <p className="eyebrow">Project</p>
              <h2 className="mt-2 text-xl font-bold">{p}</h2>
              <p className="mt-1 text-muted-foreground">
                {done} of {items.length} tasks complete
              </p>
              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
