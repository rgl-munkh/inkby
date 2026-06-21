import { formatDuration } from "@/lib/domain/duration";
import type { Appointment, BookingRequest, Schedule } from "../types";
import { STATUS_BADGE } from "../constants";
import { CalendarIconSm, ClockIconSm } from "./request-detail-icons";

export function AppointmentDetailsCard({
  request,
  schedule,
  appointment,
}: {
  request: BookingRequest;
  schedule: Schedule | null;
  appointment?: Appointment | null;
}) {
  const badgeLabel = STATUS_BADGE[request.status] ?? request.status;
  const isCancelled = request.status === "cancelled";
  const rescheduleCount = appointment?.rescheduleCount ?? 0;
  const effectiveDatetime = appointment?.chosenDatetime ?? schedule?.suggestedDatetime ?? null;
  const dateText = effectiveDatetime
    ? new Date(effectiveDatetime).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Client will choose date";

  return (
    <div className="rounded-2xl overflow-hidden bg-card">
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--muted)" }}
      >
        <p className="text-sm font-semibold text-foreground">
          Appointment details
        </p>
        <span
          className="text-xs font-semibold rounded-full px-3 py-1"
          style={{ background: isCancelled ? "var(--destructive)" : "#f97316", color: "var(--card)" }}
        >
          {badgeLabel}
        </span>
      </div>

      <div
        className="flex items-start gap-3 px-4 py-3 border-b"
        style={{ borderColor: "var(--muted)" }}
      >
        <span className="mt-0.5 shrink-0 text-muted-foreground"><CalendarIconSm /></span>
        <div>
          <p className="text-sm font-semibold text-foreground">Date</p>
          <p className="text-xs mt-0.5 text-muted-foreground">{dateText}</p>
        </div>
      </div>

      <div
        className="flex items-start gap-3 px-4 py-3"
        style={isCancelled || rescheduleCount > 0 ? { borderBottom: "1px solid var(--muted)" } : undefined}
      >
        <span className="mt-0.5 shrink-0 text-muted-foreground"><ClockIconSm /></span>
        <div>
          <p className="text-sm font-semibold text-foreground">Duration</p>
          <p className="text-xs mt-0.5 text-muted-foreground">
            {schedule ? formatDuration(schedule.durationMinutes) : "—"}
          </p>
        </div>
      </div>

      {rescheduleCount > 0 && !isCancelled && (
        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Rescheduled {rescheduleCount} {rescheduleCount === 1 ? "time" : "times"}
          </p>
        </div>
      )}

      {isCancelled && (
        <div className="px-4 py-3">
          <p className="text-sm font-semibold text-destructive">Cancelled</p>
          <p className="text-xs mt-0.5 text-muted-foreground">
            {appointment?.cancelledBy ? `By ${appointment.cancelledBy}` : "Cancelled"}
            {appointment?.cancellationReason ? ` — ${appointment.cancellationReason}` : ""}
          </p>
        </div>
      )}
    </div>
  );
}
