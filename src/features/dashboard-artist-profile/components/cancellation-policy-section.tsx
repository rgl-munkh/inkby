"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CancellationPolicySection({
  initialNoticeHours,
  initialMaxReschedules,
}: {
  initialNoticeHours: number;
  initialMaxReschedules: number;
}) {
  const [noticeHours, setNoticeHours] = useState(String(initialNoticeHours));
  const [maxReschedules, setMaxReschedules] = useState(String(initialMaxReschedules));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const dirty =
    noticeHours !== String(initialNoticeHours) ||
    maxReschedules !== String(initialMaxReschedules);

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/artist/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cancellation_notice_hours: Number(noticeHours),
          max_reschedules: Number(maxReschedules),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
      setSaved(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border p-5 flex flex-col gap-4 bg-card">
      <div>
        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
          Cancellation policy
        </p>
        <p className="text-xs mt-1 leading-relaxed text-muted-foreground">
          How far ahead clients can change a booking themselves. You can always reschedule or cancel from a request, no matter the window. Deposits are non-refundable.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notice-hours" className="text-xs text-muted-foreground">
            Notice required (hours)
          </Label>
          <Input
            id="notice-hours"
            type="number"
            min={0}
            max={720}
            value={noticeHours}
            onChange={(e) => { setNoticeHours(e.target.value); setSaved(false); }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="max-reschedules" className="text-xs text-muted-foreground">
            Max client reschedules
          </Label>
          <Input
            id="max-reschedules"
            type="number"
            min={0}
            max={20}
            value={maxReschedules}
            onChange={(e) => { setMaxReschedules(e.target.value); setSaved(false); }}
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-center text-destructive">{error}</p>
      )}

      <Button
        onClick={save}
        disabled={saving || !dirty}
        className="w-full rounded-full h-10 text-xs font-bold tracking-widest uppercase cursor-pointer"
        style={{ background: "var(--foreground)", color: "var(--card)" }}
      >
        {saving ? "SAVING..." : saved && !dirty ? "SAVED" : "SAVE POLICY"}
      </Button>
    </div>
  );
}
