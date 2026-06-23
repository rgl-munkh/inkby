"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatAmountInput, parseAmountInput } from "@/lib/domain/money";

export function BookingFeeSection({
  initialDepositAmount,
}: {
  initialDepositAmount: string | null;
}) {
  const initial = initialDepositAmount
    ? formatAmountInput(initialDepositAmount)
    : "";
  const [amount, setAmount] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const dirty = amount !== initial;

  async function save() {
    const value = parseAmountInput(amount);
    if (!amount || isNaN(value) || value <= 0) {
      setError("Enter a valid booking fee");
      return;
    }
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/artist/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deposit_amount: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
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
          Booking fee
        </p>
        <p className="text-xs mt-1 leading-relaxed text-muted-foreground">
          The deposit clients pay to lock in their appointment. Applied to every booking.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="booking-fee" className="text-xs text-muted-foreground">
          Amount
        </Label>
        <div
          className="flex items-center rounded-xl overflow-hidden"
          style={{ background: "var(--background)", border: "1px solid var(--border)" }}
        >
          <span className="pl-3 pr-1 text-sm shrink-0 text-muted-foreground">₮</span>
          <input
            id="booking-fee"
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(e) => {
              setAmount(formatAmountInput(e.target.value));
              setSaved(false);
            }}
            placeholder="0"
            className="flex-1 h-11 pr-3 text-base placeholder:text-sm outline-none bg-transparent text-foreground"
          />
        </div>
      </div>

      {error && <p className="text-xs text-center text-destructive">{error}</p>}

      <Button
        onClick={save}
        disabled={saving || !dirty}
        className="w-full rounded-full h-10 text-xs font-bold tracking-widest uppercase cursor-pointer"
        style={{ background: "var(--foreground)", color: "var(--card)" }}
      >
        {saving ? "SAVING..." : saved && !dirty ? "SAVED" : "SAVE FEE"}
      </Button>
    </div>
  );
}
