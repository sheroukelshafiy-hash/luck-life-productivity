import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/lib/i18n";
import { todayISO } from "@/lib/luck-live-store";
import {
  appointmentTypeLabel,
  appointmentTypes,
  colorLabels,
  useLifeHub,
  type AppointmentType,
  type ColorLabel,
} from "@/lib/life-hub-store";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

export function AppointmentDialog() {
  const {
    appointmentDialog,
    closeAppointmentDialog,
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  } = useLifeHub();
  const t = useT();
  const editing = appointmentDialog.id ? appointments.find((a) => a.id === appointmentDialog.id) : undefined;

  const [title, setTitle] = useState("");
  const [type, setType] = useState<AppointmentType>("meeting");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(todayISO());
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [reminder, setReminder] = useState("15");
  const [color, setColor] = useState<ColorLabel>("gold");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!appointmentDialog.open) return;
    setError("");
    setTitle(editing?.title ?? "");
    setType(editing?.type ?? "meeting");
    setCategory(editing?.category ?? "");
    setDate(editing?.date ?? appointmentDialog.date ?? todayISO());
    setStart(editing?.start ?? "09:00");
    setEnd(editing?.end ?? "10:00");
    setLocation(editing?.location ?? "");
    setNotes(editing?.notes ?? "");
    setReminder(editing?.reminder ?? "15");
    setColor(editing?.color ?? "gold");
  }, [appointmentDialog.open, appointmentDialog.id, appointmentDialog.date, editing]);

  const submit = () => {
    if (!title.trim()) {
      setError(t("Give the appointment a title."));
      return;
    }
    if (end <= start) {
      setError(t("End time must be after the start time."));
      return;
    }
    const payload = {
      title: title.trim(),
      type,
      category: category.trim() || appointmentTypeLabel[type],
      date,
      start,
      end,
      location: location.trim(),
      notes: notes.trim(),
      reminder,
      color,
    };
    if (editing) updateAppointment(editing.id, payload);
    else addAppointment(payload);
    closeAppointmentDialog();
  };

  return (
    <Dialog open={appointmentDialog.open} onOpenChange={(o) => (o ? null : closeAppointmentDialog())}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && (e.target as HTMLElement).tagName !== "TEXTAREA") {
            e.preventDefault();
            submit();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{editing ? t("Appointment details") : t("New appointment")}</DialogTitle>
          <DialogDescription>
            {t("Appointments live alongside your tasks without mixing with them.")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="eyebrow">{t("Title")}</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("Product sync")}
              className={cn(field, "mt-2")}
            />
          </div>

          <div>
            <p className="eyebrow">{t("Type")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {appointmentTypes.map((x) => (
                <button
                  key={x}
                  type="button"
                  onClick={() => setType(x)}
                  className={cn(
                    "press rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5",
                    type === x
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {t(appointmentTypeLabel[x])}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="eyebrow">{t("Date")}</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={cn(field, "mt-2")} />
            </div>
            <div>
              <label className="eyebrow">{t("Start time")}</label>
              <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={cn(field, "mt-2")} />
            </div>
            <div>
              <label className="eyebrow">{t("End time")}</label>
              <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={cn(field, "mt-2")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="eyebrow">{t("Location")}</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("Office, clinic, link…")}
                className={cn(field, "mt-2")}
              />
            </div>
            <div>
              <label className="eyebrow">{t("Category")}</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={t("Work, health, family…")}
                className={cn(field, "mt-2")}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="eyebrow">{t("Reminder (minutes before)")}</label>
              <input
                type="number"
                min={0}
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className={cn(field, "mt-2")}
              />
            </div>
            <div>
              <p className="eyebrow">{t("Color label")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {colorLabels.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-label={c.id}
                    onClick={() => setColor(c.id)}
                    style={{ background: c.token }}
                    className={cn(
                      "size-8 rounded-full transition-all duration-200 hover:scale-110",
                      color === c.id && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="eyebrow">{t("Notes")}</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={cn(field, "mt-2 resize-none")}
            />
          </div>

          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="gap-2">
          {editing ? (
            <button
              onClick={() => {
                deleteAppointment(editing.id);
                closeAppointmentDialog();
              }}
              className="press me-auto rounded-xl border border-border px-4 py-3 font-semibold text-destructive transition-colors hover:bg-destructive/10"
            >
              {t("Delete")}
            </button>
          ) : null}
          <button
            onClick={closeAppointmentDialog}
            className="press rounded-xl border border-border px-4 py-3 font-semibold transition-colors hover:bg-accent"
          >
            {t("Cancel")}
          </button>
          <button
            onClick={submit}
            className="press rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
          >
            {editing ? t("Save changes") : t("Add appointment")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
