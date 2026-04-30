"use client";

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
import { formatAmountInput } from "@/lib/domain/money";
import { formatDateLabel, formatTimeLabel as formatSlotTime } from "@/lib/domain/dates";
import { generate30MinSlots, splitDatetime } from "./lib/schedule-form";
import { useScheduleRequestForm } from "./hooks/use-schedule-request-form";
import type { ScheduleSheetBookingRequest } from "./types";

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
      <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

export function ScheduleSheet({
  open,
  onOpenChange,
  request,
  onScheduled,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  request: ScheduleSheetBookingRequest;
  onScheduled: () => void;
}) {
  const photo = request.photos?.[0]?.photoUrl;
  const {
    addDate,
    availableDates,
    dates,
    duration,
    error,
    handleSubmit,
    highAmount,
    lowAmount,
    message,
    removeDate,
    setDuration,
    setHighAmount,
    setLowAmount,
    setMessage,
    submitting,
    updateDate,
  } = useScheduleRequestForm({ open, onOpenChange, onScheduled, request });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0 overflow-y-auto border-border"
        style={{ background: "var(--muted)" }}
      >
        <SheetHeader className="px-5 pt-5 pb-4 shrink-0 border-b border-border" style={{ background: "var(--muted)" }}>
          <div className="flex items-start gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="mt-0.5 w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-60 cursor-pointer shrink-0 text-foreground"
              aria-label="Close"
            >
              <BackIcon />
            </button>
            <div>
              <SheetTitle className="text-base font-semibold text-left text-foreground">
                Schedule {request.firstName} {request.lastName}
              </SheetTitle>
              <SheetDescription className="text-[10px] font-semibold tracking-widest uppercase text-left mt-0.5 text-muted-foreground">
                Custom
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="px-5 pb-4">
          <div className="flex items-center gap-3 rounded-xl border border-border p-3 bg-card">
            {photo ? (
              <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                <Image src={photo} alt="Reference" fill sizes="56px" className="object-cover" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center bg-muted">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#b0aca6" strokeWidth="1.5" />
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="#b0aca6" strokeWidth="1.5" />
                  <path d="M21 15l-5-5L5 21" stroke="#b0aca6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">
                {request.firstName} {request.lastName}
              </p>
              <div className="flex gap-1.5 mt-0.5 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground">#{request.tattooSize}</span>
                <span className="text-xs font-medium text-muted-foreground">#{request.placement}</span>
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
                style={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" }}
              />
            </FieldBox>
            <FieldBox label="Deposit">
              <div
                className="rounded-xl px-3 h-11 flex items-center text-sm"
                style={{ background: "var(--card)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
              >
                ₮0
              </div>
            </FieldBox>
          </div>

          <div>
            <Label className="mb-1 text-muted-foreground text-[10px] font-semibold">PICK SPECIFIC DATE</Label>
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
                        style={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                      />
                      {dates.length > 1 && (
                        <button
                          onClick={() => removeDate(i)}
                          className="w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-60 cursor-pointer text-muted-foreground"
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
                      style={{ background: "var(--card)", color: selDate ? "var(--foreground)" : "var(--muted-foreground)", border: "1px solid var(--border)" }}
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
                      style={{ background: "var(--card)", color: selTime ? "var(--foreground)" : "var(--muted-foreground)", border: "1px solid var(--border)" }}
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
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-60 cursor-pointer text-muted-foreground shrink-0"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                onClick={addDate}
                className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-60 cursor-pointer text-muted-foreground"
              >
                <PlusIcon />
                Add another date
              </button>
            </div>
          </div>

          <FieldBox label="Estimate">
            <div className="grid grid-cols-2 gap-3">
              <FieldBox label="Low">
                <div className="flex items-center rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <span className="pl-3 pr-1 text-sm shrink-0 text-muted-foreground">₮</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={lowAmount}
                    onChange={(e) => setLowAmount(formatAmountInput(e.target.value))}
                    placeholder="0"
                    className="flex-1 h-11 pr-3 text-base placeholder:text-sm outline-none bg-transparent text-foreground"
                  />
                </div>
              </FieldBox>
              <FieldBox label="High">
                <div className="flex items-center rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <span className="pl-3 pr-1 text-sm shrink-0 text-muted-foreground">₮</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={highAmount}
                    onChange={(e) => setHighAmount(formatAmountInput(e.target.value))}
                    placeholder="0"
                    className="flex-1 h-11 pr-3 text-base placeholder:text-sm outline-none bg-transparent text-foreground"
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
              style={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" }}
            />
          </FieldBox>

          {error && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">{error}</p>
          )}
        </div>

        <div
          className="w-full sm:max-w-md px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 flex flex-col gap-3 border-t border-border"
          style={{ background: "linear-gradient(to top, var(--muted) 75%, transparent)" }}
        >
          <div className="flex items-center justify-center gap-1.5">
            <ShieldIcon />
            <p className="text-[10px] text-muted-foreground">
              Covered by Artist Chargeback Protection
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer"
            style={{ background: "var(--foreground)", color: "var(--card)" }}
          >
            {submitting ? "SENDING..." : `SEND TO ${request.firstName.toUpperCase()} ${request.lastName.toUpperCase()}`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
