import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLuckLive, dueLabel, todayISO, type Priority } from "@/lib/luck-live-store";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const priorities: Priority[] = ["high", "medium", "low"];

const field =
  "w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

export function TaskDialog() {
  const { taskDialog, closeTaskDialog, allTasks, addTask, updateTask } = useLuckLive();
  const t = useT();
  const editing = taskDialog.taskId ? allTasks.find((t) => t.id === taskDialog.taskId) : undefined;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("Personal");
  const [priority, setPriority] = useState<Priority>("medium");
  const [date, setDate] = useState(todayISO());
  const [reminder, setReminder] = useState("");
  const [estimate, setEstimate] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!taskDialog.open) return;
    setError("");
    setTitle(editing?.title ?? "");
    setDescription(editing?.description ?? "");
    setProject(editing?.project ?? "Personal");
    setPriority(editing?.priority ?? "medium");
    setDate(editing?.date ?? taskDialog.date ?? todayISO());
    setReminder(editing?.reminder ?? "");
    setEstimate(editing?.estimate ? String(editing.estimate) : "");
    setNotes(editing?.notes ?? "");
    setTags((editing?.tags ?? []).join(", "));
  }, [taskDialog.open, taskDialog.taskId, taskDialog.date, editing]);

  const submit = () => {
    if (!title.trim()) {
      setError(t("Give the task a title."));
      return;
    }
    const payload = {
      title: title.trim(),
      description: description.trim(),
      project: project.trim() || "Personal",
      priority,
      date,
      due: dueLabel(date),
      reminder,
      estimate: estimate ? Number(estimate) : 0,
      notes,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    if (editing) updateTask(editing.id, payload);
    else addTask(payload);
    closeTaskDialog();
  };

  return (
    <Dialog open={taskDialog.open} onOpenChange={(o) => (o ? null : closeTaskDialog())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? t("Task details") : t("Add task")}</DialogTitle>
          <DialogDescription>
            {editing ? t("Update this task and save your changes.") : t("Create a new task for your workspace.")}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <label className="eyebrow" htmlFor="task-title">{t("Title")}</label>
            <input
              id="task-title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("What needs doing?")}
              className={cn(field, "mt-2")}
            />
          </div>

          <div>
            <label className="eyebrow" htmlFor="task-desc">{t("Description")}</label>
            <textarea
              id="task-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={cn(field, "mt-2 resize-none")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="eyebrow" htmlFor="task-project">{t("Category")}</label>
              <input
                id="task-project"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className={cn(field, "mt-2")}
              />
            </div>
            <div>
              <span className="eyebrow">{t("Priority")}</span>
              <div className="mt-2 flex rounded-xl bg-muted p-1">
                {priorities.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      "flex-1 rounded-lg px-3 py-2 text-sm font-semibold capitalize transition-colors",
                      priority === p ? "bg-card text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {t(p)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="eyebrow" htmlFor="task-date">{t("Due date")}</label>
              <input
                id="task-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={cn(field, "mt-2")}
              />
            </div>
            <div>
              <label className="eyebrow" htmlFor="task-reminder">{t("Reminder")}</label>
              <input
                id="task-reminder"
                type="time"
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className={cn(field, "mt-2")}
              />
            </div>
            <div>
              <label className="eyebrow" htmlFor="task-estimate">{t("Estimated time (min)")}</label>
              <input
                id="task-estimate"
                type="number"
                min={0}
                value={estimate}
                onChange={(e) => setEstimate(e.target.value)}
                className={cn(field, "mt-2")}
              />
            </div>
            <div>
              <label className="eyebrow" htmlFor="task-tags">{t("Tags")}</label>
              <input
                id="task-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={t("deep work, review")}
                className={cn(field, "mt-2")}
              />
            </div>
          </div>

          <div>
            <label className="eyebrow" htmlFor="task-notes">{t("Notes")}</label>
            <textarea
              id="task-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={cn(field, "mt-2 resize-none")}
            />
          </div>

          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

          <DialogFooter>
            <button
              type="button"
              onClick={closeTaskDialog}
              className="press rounded-xl border border-border px-5 py-3 font-semibold transition-colors hover:bg-muted"
            >
              {t("Cancel")}
            </button>
            <button
              type="submit"
              className="press rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {editing ? t("Save changes") : t("Create task")}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
