import { formatAmount } from "@/lib/domain/money";
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
          className="rounded-xl border border-border p-6 flex flex-col items-center gap-2 text-center bg-card"
        >
          <div className="text-muted-foreground">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground">Waiting for artist to respond</p>
          <p className="text-xs text-muted-foreground">
            {artistHandle} will review your request and send a schedule soon.
          </p>
        </div>
      )}

      {(isScheduled || isConfirmed) && (
        <>
          {booking.schedules.map((s, i) => (
            <div
              key={s.id}
              className="rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer transition-opacity hover:opacity-85 bg-card"
              style={{
                border: isPaid
                  ? "1.5px solid #22c55e"
                  : isConfirmed
                    ? "1.5px solid #f59e0b"
                    : "1px solid var(--border)",
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
                  style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="3" y="10" width="8" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                    SESSION {i + 1}/{booking.schedules.length}
                  </p>
                  <p className="text-xs font-medium mt-0.5 text-foreground">
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
                <span className="text-muted-foreground"><ArrowRightIcon /></span>
              )}
              {isPaid && (
                <span className="text-emerald-600"><CheckCircleIcon /></span>
              )}
              {isPendingPayment && (
                <span className="text-amber-600">
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
              <span style={{ color: isPaid ? "#22c55e" : "#f59e0b" }}>
                <CheckCircleIcon />
              </span>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Thanks {booking.firstName} {booking.lastName}!
                </p>
                <p className="text-sm font-semibold text-foreground">
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
                className="rounded-xl border border-border p-4 flex items-center justify-between w-full text-left transition-opacity hover:opacity-85 cursor-pointer bg-card"
              >
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Book it yourself</p>
                  <p className="text-sm font-semibold mt-0.5 text-foreground">Select a date and time</p>
                  {schedule && (
                    <p className="text-xs mt-0.5 text-muted-foreground">
                      Your estimate is ₮{formatAmount(schedule.lowAmount)} — ₮{formatAmount(schedule.highAmount)}
                    </p>
                  )}
                </div>
                <span className="text-emerald-600"><CalendarPlusIcon /></span>
              </button>
            )}

            {isPaid && (
              <div
                className="rounded-xl px-4 py-3 flex items-center gap-2"
                style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
              >
                <span className="text-emerald-600"><CheckCircleIcon /></span>
                <p className="text-xs font-semibold text-emerald-600-fg">
                  Deposit paid successfully
                </p>
              </div>
            )}

            {schedule?.message && (
              <div className="rounded-xl border border-border p-4 flex gap-3 bg-card">
                <div
                  className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold"
                  style={{ background: "var(--border)", color: "var(--muted-foreground)" }}
                >
                  {artistName.replace("@", "").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Message from {artistHandle}
                  </p>
                  <p className="text-sm mt-1 text-foreground">
                    {schedule.message}
                  </p>
                  <p className="text-xs mt-1 text-muted-foreground">
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
