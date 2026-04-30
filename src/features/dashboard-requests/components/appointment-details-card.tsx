import { formatDuration } from "@/lib/domain/duration";
import type { BookingRequest, Schedule } from "../types";
import { STATUS_BADGE } from "../constants";
import { CalendarIconSm, ClockIconSm } from "./request-detail-icons";

export function AppointmentDetailsCard({
  request,
  schedule,
}: {
  request: BookingRequest;
  schedule: Schedule | null;
}) {
  const badgeLabel = STATUS_BADGE[request.status] ?? request.status;
  const dateText = schedule?.suggestedDatetime
    ? new Date(schedule.suggestedDatetime).toLocaleDateString("en-US", {
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
          style={{ background: "#f97316", color: "var(--card)" }}
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

      <div className="flex items-start gap-3 px-4 py-3">
        <span className="mt-0.5 shrink-0 text-muted-foreground"><ClockIconSm /></span>
        <div>
          <p className="text-sm font-semibold text-foreground">Duration</p>
          <p className="text-xs mt-0.5 text-muted-foreground">
            {schedule ? formatDuration(schedule.durationMinutes) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
