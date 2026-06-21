"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Artist-side reschedule + cancel for a confirmed appointment. The artist is
 * authenticated, so the API treats these actions as artist-initiated and
 * bypasses the client notice window / reschedule cap.
 */
export function AppointmentActions({
  appointmentId,
  currentDatetime,
  onChanged,
}: {
  appointmentId: string;
  currentDatetime: string | null;
  onChanged: () => void;
}) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [datetime, setDatetime] = useState(toLocalInput(currentDatetime));
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (rescheduleOpen) {
      setDatetime(toLocalInput(currentDatetime));
      setError("");
    }
  }, [rescheduleOpen, currentDatetime]);

  useEffect(() => {
    if (cancelOpen) { setReason(""); setError(""); }
  }, [cancelOpen]);

  async function submitReschedule() {
    if (!datetime) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chosen_datetime: new Date(datetime).toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
      setRescheduleOpen(false);
      onChanged();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitCancel() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reason.trim() ? { reason: reason.trim() } : {}),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
      setCancelOpen(false);
      onChanged();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setRescheduleOpen(true)}
          className="flex-1 rounded-full h-11 text-xs font-bold tracking-widest uppercase border border-border bg-card text-foreground transition-opacity hover:opacity-80 cursor-pointer"
        >
          Reschedule
        </button>
        <button
          onClick={() => setCancelOpen(true)}
          className="flex-1 rounded-full h-11 text-xs font-bold tracking-widest uppercase border border-destructive/40 text-destructive transition-opacity hover:opacity-80 cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <Sheet open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-xl border-border p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] flex flex-col gap-5"
        >
          <SheetHeader className="p-0 pr-8">
            <SheetTitle className="text-base font-semibold text-left text-foreground">
              Reschedule appointment
            </SheetTitle>
            <SheetDescription className="text-xs text-left text-muted-foreground">
              Pick a new date and time. The client will see the update.
            </SheetDescription>
          </SheetHeader>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className="w-full rounded-xl px-4 h-12 outline-none"
            style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          />
          {error && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">{error}</p>
          )}
          <Button
            onClick={submitReschedule}
            disabled={!datetime || submitting}
            className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer"
            style={{ background: "var(--foreground)", color: "var(--card)" }}
          >
            {submitting ? "SAVING..." : "SAVE NEW TIME"}
          </Button>
        </SheetContent>
      </Sheet>

      <Sheet open={cancelOpen} onOpenChange={setCancelOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-xl border-border p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] flex flex-col gap-5"
        >
          <SheetHeader className="p-0 pr-8">
            <SheetTitle className="text-base font-semibold text-left text-foreground">
              Cancel appointment?
            </SheetTitle>
            <SheetDescription className="text-xs text-left text-muted-foreground">
              This frees the slot. The deposit is non-refundable.
            </SheetDescription>
          </SheetHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional, shown to client)"
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
            style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          />
          {error && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">{error}</p>
          )}
          <Button
            onClick={submitCancel}
            disabled={submitting}
            className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer"
            style={{ background: "var(--destructive)", color: "var(--card)" }}
          >
            {submitting ? "CANCELLING..." : "CANCEL APPOINTMENT"}
          </Button>
        </SheetContent>
      </Sheet>
    </>
  );
}
