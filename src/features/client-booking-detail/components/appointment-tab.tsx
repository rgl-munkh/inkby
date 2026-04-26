import { formatAmount } from "@/lib/utils";
import type { BookingRequest, Schedule } from "../types";
import { timeAgoLong } from "../lib/time-ago";
import {
  CalendarPlusIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "./booking-detail-icons";

type AppointmentTabProps = {
  booking: BookingRequest;
  isPending: boolean;
  isScheduled: boolean;
  isConfirmed: boolean;
  isPaid: boolean;
  isPendingPayment: boolean;
  schedule: Schedule | null;
  artistHandle: string;
  artistName: string;
  onOpenChooseTime: (prefill: string | null) => void;
};

export function AppointmentTab({
  booking,
  isPending,
  isScheduled,
  isConfirmed,
  isPaid,
  isPendingPayment,
  schedule,
  artistHandle,
  artistName,
  onOpenChooseTime,
}: AppointmentTabProps) {
  return (
    <div className="px-4 pt-4 flex flex-col gap-3">

      {isPending && (
        <div
          className="rounded-2xl p-6 flex flex-col items-center gap-2 text-center bg-inkby-surface"
        >
          <div className="text-inkby-fg-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-inkby-fg">Waiting for artist to respond</p>
          <p className="text-xs text-inkby-fg-muted">
            {artistHandle} will review your request and send a schedule soon.
          </p>
        </div>
      )}

      {(isScheduled || isConfirmed) && (
        <>
          {booking.schedules.map((s, i) => (
            <div
              key={s.id}
              className="rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer transition-opacity hover:opacity-80"
              style={{
                background: "var(--inkby-surface)",
                border: isPaid
                  ? "1.5px solid var(--inkby-success)"
                  : isConfirmed
                    ? "1.5px solid var(--inkby-warning)"
                    : "1.5px solid transparent",
              }}
              onClick={() => {
                if (isScheduled) {
                  onOpenChooseTime(s.suggestedDatetime ?? null);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "var(--inkby-surface-soft)", color: "var(--inkby-fg-muted)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="3" y="10" width="8" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-inkby-fg-placeholder">
                    SESSION {i + 1}/{booking.schedules.length}
                  </p>
                  <p className="text-xs font-medium mt-0.5 text-inkby-fg">
                    {s.suggestedDatetime
                      ? new Date(s.suggestedDatetime).toLocaleDateString("en-US", {
                          weekday: "short", month: "short", day: "numeric",
                          hour: "numeric", minute: "2-digit",
                        })
                      : "Client will choose date"}
                  </p>
                </div>
              </div>
              {isScheduled && (
                <span className="text-inkby-fg-muted"><ArrowRightIcon /></span>
              )}
              {isPaid && (
                <span className="text-inkby-success"><CheckCircleIcon /></span>
              )}
              {isPendingPayment && (
                <span className="text-inkby-warning">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </div>
          ))}

          <div className="flex flex-col gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span style={{ color: isPaid ? "var(--inkby-success)" : "var(--inkby-warning)" }}>
                <CheckCircleIcon />
              </span>
              <div>
                <p className="text-xs font-semibold text-inkby-fg-muted">
                  Thanks {booking.firstName} {booking.lastName}!
                </p>
                <p className="text-sm font-semibold text-inkby-fg">
                  {isPaid
                    ? "Deposit paid — you're all set!"
                    : isPendingPayment
                      ? "Deposit required to lock in your slot."
                      : "Appointment confirmed."}
                </p>
              </div>
            </div>

            {isScheduled && (
              <button
                onClick={() => onOpenChooseTime(null)}
                className="rounded-2xl p-4 flex items-center justify-between w-full text-left transition-opacity hover:opacity-80 cursor-pointer bg-inkby-surface"
              >
                <div>
                  <p className="text-xs font-semibold text-inkby-fg-muted">Book it yourself</p>
                  <p className="text-sm font-semibold mt-0.5 text-inkby-fg">Select a date and time</p>
                  {schedule && (
                    <p className="text-xs mt-0.5 text-inkby-fg-secondary">
                      Your estimate is ₮{formatAmount(schedule.lowAmount)} — ₮{formatAmount(schedule.highAmount)}
                    </p>
                  )}
                </div>
                <span className="text-inkby-success"><CalendarPlusIcon /></span>
              </button>
            )}

            {isPaid && (
              <div
                className="rounded-2xl px-4 py-3 flex items-center gap-2"
                style={{ background: "var(--inkby-success-bg)", border: "1px solid var(--inkby-success-border)" }}
              >
                <span className="text-inkby-success"><CheckCircleIcon /></span>
                <p className="text-xs font-semibold text-inkby-success-fg">
                  Deposit paid successfully
                </p>
              </div>
            )}

            {schedule?.message && (
              <div className="rounded-2xl p-4 flex gap-3 bg-inkby-surface-soft">
                <div
                  className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold"
                  style={{ background: "var(--inkby-border)", color: "var(--inkby-fg-muted)" }}
                >
                  {artistName.replace("@", "").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-inkby-fg-muted">
                    Message from {artistHandle}
                  </p>
                  <p className="text-sm mt-1 text-inkby-fg">
                    {schedule.message}
                  </p>
                  <p className="text-xs mt-1 text-inkby-fg-placeholder">
                    {timeAgoLong(schedule.createdAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
