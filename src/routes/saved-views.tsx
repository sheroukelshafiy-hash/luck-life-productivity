import { createFileRoute } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/saved-views")({
  head: () => ({
    meta: [
      { title: "Saved views — Luck Live" },
      { name: "description", content: "Reusable filters for the slices of work you check most often." },
      { property: "og:title", content: "Saved views — Luck Live" },
      { property: "og:description", content: "Reusable filters for the slices of work you check most often." },
    ],
  }),
  component: SavedViewsPage,
});

const views = [
  { name: "High priority today", note: "Priority is high · due today" },
  { name: "Product launch", note: "Project · Product launch" },
  { name: "Waiting on review", note: "Team ops · blocked" },
  { name: "Finished this week", note: "Completed · last 7 days" },
];

function SavedViewsPage() {
  return (
    <AppShell
      breadcrumb="Saved views"
      eyebrow="Your space / Saved views"
      title="Saved views"
      subtitle="Jump straight to the slice of work you care about right now."
    >
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {views.map((v) => (
          <button
            key={v.name}
            className="card-surface p-6 text-start transition-colors hover:border-primary"
          >
            <span className="flex size-11 items-center justify-center rounded-2xl bg-muted text-primary">
              <Bookmark className="size-5" />
            </span>
            <h2 className="mt-4 text-xl font-bold">{v.name}</h2>
            <p className="mt-1 text-muted-foreground">{v.note}</p>
          </button>
        ))}
      </div>
    </AppShell>
  );
}
