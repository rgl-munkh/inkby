"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export function ChooseTimeSheet({
  open,
  onOpenChange,
  onConfirm,
  submitting,
  error,
  prefillDatetime,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (datetime: string) => void;
  submitting: boolean;
  error: string;
  prefillDatetime?: string | null;
}) {
  const toLocalInput = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [chosen, setChosen] = useState(prefillDatetime ? toLocalInput(prefillDatetime) : "");

  useEffect(() => {
    // Sync sheet field when opening or when artist-suggested datetime changes (legacy behavior).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset when sheet opens / prefill changes
    setChosen(prefillDatetime ? toLocalInput(prefillDatetime) : "");
  }, [prefillDatetime, open]);

  function handleSubmit() {
    if (!chosen) return;
    onConfirm(new Date(chosen).toISOString());
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl p-6 flex flex-col gap-5">
        <SheetHeader>
          <SheetTitle className="text-base font-semibold text-left text-inkby-fg">
            Choose a time
          </SheetTitle>
          <SheetDescription className="text-xs text-left text-inkby-fg-muted">
            Pick your preferred date and time for the appointment.
          </SheetDescription>
        </SheetHeader>
        <input
          type="datetime-local"
          value={chosen}
          onChange={(e) => setChosen(e.target.value)}
          className="w-full rounded-xl px-4 h-12 placeholder:text-sm outline-none"
          style={{ background: "var(--inkby-surface-warm)", color: "var(--inkby-fg)", border: "1px solid var(--inkby-border)" }}
        />
        {error && (
          <p className="text-xs text-center text-inkby-error">{error}</p>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!chosen || submitting}
          className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer"
          style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
        >
          {submitting ? "CONFIRMING..." : "CONFIRM APPOINTMENT"}
        </Button>
      </SheetContent>
    </Sheet>
  );
}
