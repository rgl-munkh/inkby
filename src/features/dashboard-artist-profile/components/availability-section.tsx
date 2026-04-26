"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDateLabel, formatTimeLabel, todayStr } from "@/lib/utils";
import type { AvailableDate } from "../types";
import { ClockIcon, TrashSmIcon } from "./profile-icons";

export function AvailabilitySection() {
  const [dates, setDates] = useState<AvailableDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [addDate, setAddDate] = useState("");
  const [addStart, setAddStart] = useState("10:00");
  const [addEnd, setAddEnd] = useState("18:00");
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/artist/availability")
      .then((r) => r.json())
      .then((data) => {
        if (data.availableDates) {
          setDates(
            (data.availableDates as AvailableDate[]).map((r) => ({
              date: r.date,
              startTime: r.startTime,
              endTime: r.endTime,
            }))
          );
        }
      })
      .catch(() => setDates([]))
      .finally(() => setLoading(false));
  }, []);

  function handleAdd() {
    setAddError(null);
    if (!addDate) { setAddError("Pick a date"); return; }
    if (addEnd <= addStart) { setAddError("End time must be after start time"); return; }
    if (dates.some((d) => d.date === addDate)) { setAddError("Date already added"); return; }
    setDates((prev) =>
      [...prev, { date: addDate, startTime: addStart, endTime: addEnd }]
        .sort((a, b) => a.date.localeCompare(b.date))
    );
    setAddDate("");
  }

  function handleRemove(dateStr: string) {
    setDates((prev) => prev.filter((d) => d.date !== dateStr));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/artist/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dates),
      });
      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error ?? "Failed to save");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 bg-inkby-surface">
      <div className="flex items-center gap-2">
        <span className="text-inkby-fg-placeholder"><ClockIcon /></span>
        <p className="text-xs font-bold tracking-widest uppercase text-inkby-fg">
          Available Dates
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-11 w-full rounded-xl" />)}
        </div>
      ) : (
        <>
          {dates.length === 0 ? (
            <p className="text-xs text-inkby-fg-muted text-center py-2">
              No available dates yet. Add one below.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {dates.map((row) => (
                <div
                  key={row.date}
                  className="flex items-center gap-3 rounded-xl px-3 h-11"
                  style={{ background: "var(--inkby-surface-soft)" }}
                >
                  <span className="flex-1 text-xs font-semibold text-inkby-fg truncate">
                    {formatDateLabel(row.date)}
                  </span>
                  <span className="text-xs text-inkby-fg-muted shrink-0">
                    {formatTimeLabel(row.startTime)} – {formatTimeLabel(row.endTime)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(row.date)}
                    aria-label={`Remove ${row.date}`}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-opacity hover:opacity-60 cursor-pointer text-inkby-fg-muted"
                  >
                    <TrashSmIcon />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2 pt-1">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-inkby-fg-muted">
              Add a day
            </p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={addDate}
                min={todayStr()}
                onChange={(e) => { setAddDate(e.target.value); setAddError(null); }}
                className="flex-1 h-9 rounded-xl px-3 text-xs outline-none min-w-0 cursor-pointer"
                style={{
                  background: "var(--inkby-surface-soft)",
                  color: "var(--inkby-fg)",
                  border: "1px solid var(--inkby-border)",
                }}
              />
              <input
                type="time"
                value={addStart}
                onChange={(e) => setAddStart(e.target.value)}
                className="w-24 h-9 rounded-xl px-2 text-xs outline-none cursor-pointer"
                style={{
                  background: "var(--inkby-surface-soft)",
                  color: "var(--inkby-fg)",
                  border: "1px solid var(--inkby-border)",
                }}
              />
              <span className="text-xs text-inkby-fg-muted shrink-0">–</span>
              <input
                type="time"
                value={addEnd}
                onChange={(e) => setAddEnd(e.target.value)}
                className="w-24 h-9 rounded-xl px-2 text-xs outline-none cursor-pointer"
                style={{
                  background: "var(--inkby-surface-soft)",
                  color: "var(--inkby-fg)",
                  border: "1px solid var(--inkby-border)",
                }}
              />
              <button
                type="button"
                onClick={handleAdd}
                className="shrink-0 h-9 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-opacity hover:opacity-80"
                style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
              >
                + Add
              </button>
            </div>
            {addError && (
              <p className="text-xs text-inkby-error">{addError}</p>
            )}
          </div>
        </>
      )}

      {saveError && (
        <p className="text-xs text-inkby-error text-center">{saveError}</p>
      )}

      <Button
        onClick={handleSave}
        disabled={saving || loading}
        className="w-full rounded-full h-10 text-xs font-bold tracking-widest uppercase cursor-pointer"
        style={{
          background: saved ? "var(--inkby-success)" : "var(--inkby-fg)",
          color: "var(--inkby-surface)",
          opacity: saving || loading ? 0.7 : 1,
        }}
      >
        {saving ? "SAVING…" : saved ? "SAVED!" : "SAVE AVAILABILITY"}
      </Button>
    </div>
  );
}
