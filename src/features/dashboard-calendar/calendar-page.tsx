"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { clonePageVaryPathWithNewSearchParams } from "next/dist/client/components/segment-cache/vary-path";

type BookingRequestSnippet = {
  id: string;
  firstName: string;
  lastName: string;
  tattooSize?: string;
  placement?: string;
  status?: string;
};

type ScheduleSnippet = {
  durationMinutes?: number;
  lowAmount?: string;
  highAmount?: string;
};

type Appointment = {
  id: string;
  chosenDatetime: string;
  status: string;
  bookingRequest: BookingRequestSnippet;
  bookingRequestId: string;
  schedule: ScheduleSnippet | null;
};

type PendingSchedule = {
  id: string;
  suggestedDatetime: string | null;
  bookingRequestId: string;
  durationMinutes: number;
  bookingRequest: BookingRequestSnippet;
};

type CalendarEvent = {
  id: string;
  datetime: Date;
  clientName: string;
  tattooSize: string;
  placement: string;
  durationMinutes: number;
  type: "confirmed" | "pending";
  bookingRequestId: string;
};

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

void clonePageVaryPathWithNewSearchParams;

function formatTime(date: Date): string {
  let hours = date.getHours();
  const mins = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const minStr = mins > 0 ? `:${String(mins).padStart(2, "0")}` : "";
  return `${hours}${minStr} ${ampm}`;
}

function groupByMonth(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const key = `${MONTHS[ev.datetime.getMonth()]} ${ev.datetime.getFullYear()}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(ev);
  }
  return map;
}

function CalendarSkeleton() {
  return (
    <div className="px-4 flex flex-col gap-3 pt-2">
      <Skeleton className="h-4 w-24 mb-1" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 rounded-2xl p-4 bg-card">
          <div className="flex flex-col items-center gap-1 w-8 shrink-0">
            <Skeleton className="h-3 w-7" />
            <Skeleton className="h-5 w-6" />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EventCard({ ev }: { ev: CalendarEvent }) {
  const weekday = WEEKDAYS[ev.datetime.getDay()];
  const day = ev.datetime.getDate();
  const time = formatTime(ev.datetime);
  const isConfirmed = ev.type === "confirmed";

  return (
    <Link
      href={`/dashboard/requests/${ev.bookingRequestId}`}
      className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-opacity hover:opacity-80 cursor-pointer"
      style={{
        background: "var(--card)",
        borderLeft: isConfirmed
          ? "3px solid #86efac"
          : "3px solid var(--border)",
      }}
    >
      <div className="flex flex-col items-center w-8 shrink-0">
        <span className="text-[9px] font-bold tracking-widest text-muted-foreground">
          {weekday}
        </span>
        <span className="text-base font-bold leading-tight text-foreground">
          {day}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate text-foreground">
          {ev.clientName}
          <span className="font-normal ml-1 text-muted-foreground">({time})</span>
        </p>
        <p className="text-[11px] mt-0.5 truncate text-muted-foreground">
          {ev.tattooSize}{ev.placement ? ` / ${ev.placement}` : ""}
        </p>
      </div>

      <span
        className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full"
        style={
          isConfirmed
            ? { border: "1px solid #86efac", color: "#16a34a", background: "#f0fdf4" }
            : { border: "1px solid var(--border)", color: "var(--muted-foreground)", background: "var(--muted)" }
        }
      >
        {isConfirmed ? "Confirmed" : "Pending"}
      </span>
    </Link>
  );
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 6);

    fetch(
      `/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`
    )
      .then((r) => r.json())
      .then((data) => {
        const merged: CalendarEvent[] = [];

        for (const appt of (data.appointments ?? []) as Appointment[]) {
          if (!appt.bookingRequest) continue;
          merged.push({
            id: appt.id,
            datetime: new Date(appt.chosenDatetime),
            clientName: `${appt.bookingRequest.firstName} ${appt.bookingRequest.lastName}`,
            tattooSize: appt.bookingRequest.tattooSize ?? "",
            placement: appt.bookingRequest.placement ?? "",
            durationMinutes: appt.schedule?.durationMinutes ?? 0,
            type: "confirmed",
            bookingRequestId: appt.bookingRequestId,
          });
        }

        for (const sched of (data.pending_schedules ?? []) as PendingSchedule[]) {
          if (!sched.suggestedDatetime || !sched.bookingRequest) continue;
          merged.push({
            id: sched.id,
            datetime: new Date(sched.suggestedDatetime),
            clientName: `${sched.bookingRequest.firstName} ${sched.bookingRequest.lastName}`,
            tattooSize: "",
            placement: "",
            durationMinutes: sched.durationMinutes,
            type: "pending",
            bookingRequestId: sched.bookingRequestId,
          });
        }

        merged.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
        setEvents(merged);
      })
      .catch(() => setError("Failed to load calendar"))
      .finally(() => setLoading(false));
  }, []);

  const groups = groupByMonth(events);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col min-h-full pb-6 bg-background">
      <header className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-1.5">
          <h1 className="text-xl font-bold text-foreground">Schedule</h1>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="#9e9a94" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {!loading && events.length > 0 && (
          <span
            className="text-xs font-semibold rounded-full px-2 py-0.5"
            style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
          >
            {events.length}
          </span>
        )}
      </header>

      {loading ? (
        <CalendarSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <p className="text-sm font-semibold text-foreground">Something went wrong</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-semibold underline text-muted-foreground cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-8 py-20 gap-4 text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground">
            No upcoming appointments
          </p>
          <p className="text-xs max-w-xs leading-relaxed text-muted-foreground">
            Confirmed and pending appointments will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5 px-4">
          {[...groups.entries()].map(([monthLabel, monthEvents]) => (
            <section key={monthLabel}>
              <div className="mb-2">
                <p className="text-sm font-bold text-foreground">{monthLabel}</p>
                <p className="text-[11px] text-muted-foreground">
                  {monthEvents.length} appointment{monthEvents.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {monthEvents.map((ev) => (
                  <EventCard key={ev.id} ev={ev} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
