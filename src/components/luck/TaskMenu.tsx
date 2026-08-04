import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLuckLive, dueLabel, toISODate, type Task, type Priority } from "@/lib/luck-live-store";
import { useT } from "@/lib/i18n";

const priorities: Priority[] = ["high", "medium", "low"];
const categories = ["Personal", "Product launch", "Team ops", "Growth sprint"];

export function TaskMenu({ task }: { task: Task }) {
  const { toggleTask, deleteTask, duplicateTask, archiveTask, updateTask, openTaskDialog } =
    useLuckLive();
  const t = useT();

  const shift = (days: number) => {
    const base = task.date ? new Date(`${task.date}T00:00:00`) : new Date();
    base.setDate(base.getDate() + days);
    const iso = toISODate(base);
    updateTask(task.id, { date: iso, due: dueLabel(iso) });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${t("Task actions")}: ${task.title}`}
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreHorizontal className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => openTaskDialog({ taskId: task.id })}>{t("Edit")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => toggleTask(task.id)}>
          {task.done ? t("Mark incomplete") : t("Mark complete")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => duplicateTask(task.id)}>{t("Duplicate")}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{t("Priority")}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {priorities.map((p) => (
              <DropdownMenuItem key={p} onClick={() => updateTask(task.id, { priority: p })}>
                <span className="capitalize">{t(p)}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{t("Category")}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {categories.map((c) => (
              <DropdownMenuItem key={c} onClick={() => updateTask(task.id, { project: c })}>
                {c}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{t("Due date")}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => shift(0)}>{t("Keep, refresh label")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => shift(1)}>{t("Push 1 day")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => shift(7)}>{t("Push 1 week")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => openTaskDialog({ taskId: task.id })}>
              {t("Pick a date…")}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => archiveTask(task.id, !task.archived)}>
          {task.archived ? t("Unarchive") : t("Archive")}
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={() => deleteTask(task.id)}>
          {t("Delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
