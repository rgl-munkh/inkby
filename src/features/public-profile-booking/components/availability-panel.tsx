"use client";

import { useState, useEffect } from "react";

type SlotEntry = { time: string; available: boolean };
type SlotDate = { date: string; startTime: string; endTime: string; slots: SlotEntry[] };

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfWeek(d: Date): Date {
  const c = new Date(d);
  c.setDate(c.getDate() - c.getDay());
  c.setHours(0, 0, 0, 0);
  return c;
}

function formatSlotTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function PanelSpinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function AvailabilityPanel({
  slug,
  onClose,
  onSelect,
}: {
  slug: string;
  onClose: () => void;
  onSelect: (datetime: string) => void;
}) {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [slotDates, setSlotDates] = useState<SlotDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setSelectedDay(null);
      setSelectedSlot(null);
      try {
        const r = await fetch(`/api/artist/${slug}/slots?date=${toDateStr(weekStart)}`);
        const data = await r.json();
        if (cancelled) return;
        const dates: SlotDate[] = data.dates ?? [];
        setSlotDates(dates);
        if (dates.length > 0) setSelectedDay(dates[0].date);
      } catch {
        if (!cancelled) setSlotDates([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [weekStart, slug]);

  function prevWeek() {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
  }

  function nextWeek() {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const availableDateSet = new Set(slotDates.map((s) => s.date));
  const activeSlotDate = slotDates.find((s) => s.date === selectedDay);

  const monthLabel = `${MONTHS[weekStart.getMonth()]}`;

  function handleConfirm() {
    if (!selectedDay || !selectedSlot) return;
    onSelect(`${selectedDay}T${selectedSlot}`);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-sm h-full overflow-hidden"
        style={{ background: "var(--background)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 pt-5 pb-3 shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-70 cursor-pointer shrink-0"
            style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="text-sm font-semibold text-foreground">@{slug}&apos;s availability</p>
        </div>

        <div className="px-4 pb-3 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevWeek}
              className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-opacity hover:opacity-70"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
              aria-label="Previous week"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="text-sm font-bold text-foreground">{monthLabel}</p>
            <button
              onClick={nextWeek}
              className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-opacity hover:opacity-70"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
              aria-label="Next week"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((d) => {
              const ds = toDateStr(d);
              const hasSlots = availableDateSet.has(ds);
              const isSelected = selectedDay === ds;
              return (
                <button
                  key={ds}
                  type="button"
                  disabled={!hasSlots || loading}
                  onClick={() => { setSelectedDay(ds); setSelectedSlot(null); }}
                  className="flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                  style={{
                    background: isSelected ? "var(--foreground)" : "transparent",
                    opacity: !hasSlots ? 0.35 : 1,
                  }}
                >
                  <span
                    className="text-[9px] font-bold tracking-widest"
                    style={{ color: isSelected ? "var(--card)" : "var(--muted-foreground)" }}
                  >
                    {WEEK_DAYS[d.getDay()].toUpperCase()}
                  </span>
                  <span
                    className="text-base font-bold leading-tight"
                    style={{ color: isSelected ? "var(--card)" : "var(--foreground)" }}
                  >
                    {d.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-32">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <PanelSpinner />
            </div>
          ) : !activeSlotDate ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="text-sm font-semibold text-foreground">No availability this week</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Try navigating to another week.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {activeSlotDate.slots.map((slot) => {
                const isChosen = selectedSlot === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot.time)}
                    className="flex items-center justify-between py-3 px-1 border-b transition-opacity cursor-pointer disabled:cursor-not-allowed"
                    style={{
                      borderColor: "var(--border)",
                      opacity: slot.available ? 1 : 0.35,
                      background: isChosen ? "var(--muted)" : "transparent",
                    }}
                  >
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {formatSlotTime(slot.time)}
                    </span>
                    <span
                      className="text-xs font-semibold rounded-full px-3 py-1"
                      style={
                        isChosen
                          ? { background: "var(--foreground)", color: "var(--card)" }
                          : slot.available
                            ? { background: "var(--muted)", color: "var(--muted-foreground)" }
                            : { background: "transparent", color: "var(--muted-foreground)" }
                      }
                    >
                      {slot.available ? "Available" : "Booked"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4"
          style={{ background: "linear-gradient(to top, var(--background) 70%, transparent)" }}
        >
          <button
            type="button"
            disabled={!selectedSlot}
            onClick={handleConfirm}
            className="w-full h-12 rounded-full text-sm font-bold tracking-widest uppercase transition-opacity cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: "var(--foreground)",
              color: "var(--card)",
              opacity: selectedSlot ? 1 : 0.45,
            }}
          >
            SELECT A DATE + TIME
          </button>
        </div>
      </div>
    </div>
  );
}
