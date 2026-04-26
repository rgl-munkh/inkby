"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { parseDuration, formatDateLabel, formatTimeLabel as formatSlotTime, formatAmountInput, parseAmountInput } from "@/lib/utils";

type BookingRequest = {
  id: string;
  firstName: string;
  lastName: string;
  tattooSize: string;
  placement: string;
  photos: { id: string; photoUrl: string }[];
};

type AvailableDateEntry = {
  date: string;
  startTime: string;
  endTime: string;
};

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FieldBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-semibold tracking-widest uppercase text-inkby-fg-muted">
        {label}
      </p>
      {children}
    </div>
  );
}

function generate30MinSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let mins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  while (mins < endMins) {
    slots.push(`${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`);
    mins += 30;
  }
  return slots;
}

function splitDatetime(val: string): { date: string; time: string } {
  if (!val) return { date: "", time: "" };
  const [date, time = ""] = val.split("T");
  return { date, time: time.slice(0, 5) };
}

export function ScheduleSheet({
  open,
  onOpenChange,
  request,
  onScheduled,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  request: BookingRequest;
  onScheduled: () => void;
}) {
  const photo = request.photos?.[0]?.photoUrl;
  const [duration, setDuration] = useState("1h30m");
  const [lowAmount, setLowAmount] = useState("");
  const [highAmount, setHighAmount] = useState("");
  const [dates, setDates] = useState<string[]>([""]);
  const [message, setMessage] = useState(
    `Hey ${request.firstName}, I'm so excited to work with you on this! Let me know if the dates work, if not we can find other times`
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [availableDates, setAvailableDates] = useState<AvailableDateEntry[]>([]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/artist/availability")
      .then((r) => r.json())
      .then((data) => { if (data.availableDates) setAvailableDates(data.availableDates); })
      .catch(() => setAvailableDates([]));
  }, [open]);

  function addDate() {
    setDates((prev) => [...prev, ""]);
  }

  function removeDate(i: number) {
    setDates((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateDate(i: number, val: string) {
    setDates((prev) => prev.map((d, idx) => (idx === i ? val : d)));
  }

  async function handleSubmit() {
    setError("");
    const durationMins = parseDuration(duration);
    if (!durationMins) {
      setError("Invalid duration. Use format like 1h30m, 2h, or 45m");
      return;
    }
    const low = parseAmountInput(lowAmount);
    const high = parseAmountInput(highAmount);
    if (!lowAmount || isNaN(low) || low <= 0) {
      setError("Enter a valid low estimate");
      return;
    }
    if (!highAmount || isNaN(high) || high <= 0) {
      setError("Enter a valid high estimate");
      return;
    }
    if (high < low) {
      setError("High estimate must be greater than or equal to low");
      return;
    }

    const suggested_dates = dates
      .filter(Boolean)
      .map((d) => ({ datetime: new Date(d).toISOString() }));

    setSubmitting(true);
    try {
      const res = await fetch(`/api/booking-requests/${request.id}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration_minutes: durationMins,
          suggested_dates,
          low_amount: low,
          high_amount: high,
          message: message.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }

      onOpenChange(false);
      onScheduled();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0 overflow-y-auto"
        style={{ background: "var(--inkby-surface-warm)" }}
      >
        <SheetHeader className="px-5 pt-5 pb-4 shrink-0" style={{ background: "var(--inkby-surface-warm)" }}>
          <div className="flex items-start gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="mt-0.5 w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-60 cursor-pointer shrink-0 text-inkby-fg"
              aria-label="Close"
            >
              <BackIcon />
            </button>
            <div>
              <SheetTitle className="text-base font-semibold text-left text-inkby-fg">
                Schedule {request.firstName} {request.lastName}
              </SheetTitle>
              <SheetDescription className="text-[10px] font-semibold tracking-widest uppercase text-left mt-0.5 text-inkby-fg-muted">
                Custom
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="px-5 pb-4">
          <div className="flex items-center gap-3 rounded-2xl p-3 bg-inkby-surface">
            {photo ? (
              <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                <Image src={photo} alt="Reference" fill className="object-cover" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center bg-inkby-surface-neutral">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#b0aca6" strokeWidth="1.5" />
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="#b0aca6" strokeWidth="1.5" />
                  <path d="M21 15l-5-5L5 21" stroke="#b0aca6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-inkby-fg">
                {request.firstName} {request.lastName}
              </p>
              <div className="flex gap-1.5 mt-0.5 flex-wrap">
                <span className="text-xs font-medium text-inkby-fg-muted">#{request.tattooSize}</span>
                <span className="text-xs font-medium text-inkby-fg-muted">#{request.placement}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 flex flex-col gap-4 flex-1 pb-32">
          <div className="grid grid-cols-2 gap-3">
            <FieldBox label="Duration">
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="1h30m"
                className="rounded-xl px-3 h-11 placeholder:text-sm outline-none w-full"
                style={{ background: "var(--inkby-surface)", color: "var(--inkby-fg)", border: "1px solid var(--inkby-border)" }}
              />
            </FieldBox>
            <FieldBox label="Deposit">
              <div
                className="rounded-xl px-3 h-11 flex items-center text-sm"
                style={{ background: "var(--inkby-surface)", color: "var(--inkby-fg-muted)", border: "1px solid var(--inkby-border)" }}
              >
                ₮0
              </div>
            </FieldBox>
          </div>

          <div>
            <Label className="mb-1 text-inkby-fg-muted text-[10px] font-semibold">PICK SPECIFIC DATE</Label>
            <div className="flex flex-col gap-2">
              {dates.map((d, i) => {
                const { date: selDate, time: selTime } = splitDatetime(d);

                if (availableDates.length === 0) {
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="datetime-local"
                        value={d}
                        onChange={(e) => updateDate(i, e.target.value)}
                        className="flex-1 rounded-xl px-3 h-11 placeholder:text-sm outline-none"
                        style={{ background: "var(--inkby-surface)", color: "var(--inkby-fg)", border: "1px solid var(--inkby-border)" }}
                      />
                      {dates.length > 1 && (
                        <button
                          onClick={() => removeDate(i)}
                          className="w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-60 cursor-pointer text-inkby-fg-muted"
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  );
                }

                const slots = selDate
                  ? generate30MinSlots(
                      availableDates.find((a) => a.date === selDate)?.startTime ?? "00:00",
                      availableDates.find((a) => a.date === selDate)?.endTime ?? "00:00"
                    )
                  : [];

                return (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      value={selDate}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        updateDate(i, newDate ? `${newDate}T` : "");
                      }}
                      className="flex-1 rounded-xl px-3 h-11 text-sm outline-none cursor-pointer min-w-0"
                      style={{ background: "var(--inkby-surface)", color: selDate ? "var(--inkby-fg)" : "var(--inkby-fg-placeholder)", border: "1px solid var(--inkby-border)" }}
                    >
                      <option value="">Pick a date…</option>
                      {availableDates.map((a) => (
                        <option key={a.date} value={a.date}>
                          {formatDateLabel(a.date)}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selTime}
                      disabled={!selDate || slots.length === 0}
                      onChange={(e) => updateDate(i, selDate ? `${selDate}T${e.target.value}` : "")}
                      className="w-32 shrink-0 rounded-xl px-3 h-11 text-sm outline-none cursor-pointer disabled:cursor-not-allowed"
                      style={{ background: "var(--inkby-surface)", color: selTime ? "var(--inkby-fg)" : "var(--inkby-fg-placeholder)", border: "1px solid var(--inkby-border)" }}
                    >
                      <option value="">Time…</option>
                      {slots.map((s) => (
                        <option key={s} value={s}>
                          {formatSlotTime(s)}
                        </option>
                      ))}
                    </select>

                    {dates.length > 1 && (
                      <button
                        onClick={() => removeDate(i)}
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-60 cursor-pointer text-inkby-fg-muted shrink-0"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                onClick={addDate}
                className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-60 cursor-pointer text-inkby-fg-secondary"
              >
                <PlusIcon />
                Add another date
              </button>
            </div>
          </div>

          <FieldBox label="Estimate">
            <div className="grid grid-cols-2 gap-3">
              <FieldBox label="Low">
                <div className="flex items-center rounded-xl overflow-hidden" style={{ background: "var(--inkby-surface)", border: "1px solid var(--inkby-border)" }}>
                  <span className="pl-3 pr-1 text-sm shrink-0 text-inkby-fg-muted">₮</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={lowAmount}
                    onChange={(e) => setLowAmount(formatAmountInput(e.target.value))}
                    placeholder="0"
                    className="flex-1 h-11 pr-3 text-base placeholder:text-sm outline-none bg-transparent text-inkby-fg"
                  />
                </div>
              </FieldBox>
              <FieldBox label="High">
                <div className="flex items-center rounded-xl overflow-hidden" style={{ background: "var(--inkby-surface)", border: "1px solid var(--inkby-border)" }}>
                  <span className="pl-3 pr-1 text-sm shrink-0 text-inkby-fg-muted">₮</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={highAmount}
                    onChange={(e) => setHighAmount(formatAmountInput(e.target.value))}
                    placeholder="0"
                    className="flex-1 h-11 pr-3 text-base placeholder:text-sm outline-none bg-transparent text-inkby-fg"
                  />
                </div>
              </FieldBox>
            </div>
          </FieldBox>

          <FieldBox label={`Message to ${request.firstName}`}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="rounded-2xl px-4 py-3 text-sm resize-none outline-none w-full"
              style={{ background: "var(--inkby-surface)", color: "var(--inkby-fg)", border: "1px solid var(--inkby-border)" }}
            />
          </FieldBox>

          {error && (
            <p className="text-xs text-center text-inkby-error">{error}</p>
          )}
        </div>

        <div
          className="w-full sm:max-w-md px-5 pb-6 pt-3 flex flex-col gap-3"
          style={{ background: "linear-gradient(to top, var(--inkby-surface-warm) 75%, transparent)" }}
        >
          <div className="flex items-center justify-center gap-1.5">
            <ShieldIcon />
            <p className="text-[10px] text-inkby-fg-muted">
              Covered by Artist Chargeback Protection
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer"
            style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
          >
            {submitting ? "SENDING..." : `SEND TO ${request.firstName.toUpperCase()} ${request.lastName.toUpperCase()}`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
