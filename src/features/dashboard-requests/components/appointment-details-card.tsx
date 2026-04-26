import { formatDuration } from "@/lib/utils";
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
    <div className="rounded-2xl overflow-hidden bg-inkby-surface">
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--inkby-surface-soft)" }}
      >
        <p className="text-sm font-semibold text-inkby-fg">
          Appointment details
        </p>
        <span
          className="text-xs font-semibold rounded-full px-3 py-1"
          style={{ background: "var(--inkby-orange)", color: "var(--inkby-surface)" }}
        >
          {badgeLabel}
        </span>
      </div>

      <div
        className="flex items-start gap-3 px-4 py-3 border-b"
        style={{ borderColor: "var(--inkby-surface-soft)" }}
      >
        <span className="mt-0.5 shrink-0 text-inkby-fg-muted"><CalendarIconSm /></span>
        <div>
          <p className="text-sm font-semibold text-inkby-fg">Date</p>
          <p className="text-xs mt-0.5 text-inkby-fg-secondary">{dateText}</p>
        </div>
      </div>

      <div className="flex items-start gap-3 px-4 py-3">
        <span className="mt-0.5 shrink-0 text-inkby-fg-muted"><ClockIconSm /></span>
        <div>
          <p className="text-sm font-semibold text-inkby-fg">Duration</p>
          <p className="text-xs mt-0.5 text-inkby-fg-secondary">
            {schedule ? formatDuration(schedule.durationMinutes) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
