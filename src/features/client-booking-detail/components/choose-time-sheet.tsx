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
      <SheetContent
        side="bottom"
        className="rounded-t-xl border-border p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] flex flex-col gap-5"
      >
        <SheetHeader className="p-0 pr-8">
          <SheetTitle className="text-base font-semibold text-left text-foreground">
            Choose a time
          </SheetTitle>
          <SheetDescription className="text-xs text-left text-muted-foreground">
            Pick your preferred date and time for the appointment.
          </SheetDescription>
        </SheetHeader>
        <input
          type="datetime-local"
          value={chosen}
          onChange={(e) => setChosen(e.target.value)}
          className="w-full rounded-xl px-4 h-12 placeholder:text-sm outline-none"
          style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}
        />
        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">{error}</p>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!chosen || submitting}
          className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer"
          style={{ background: "var(--foreground)", color: "var(--card)" }}
        >
          {submitting ? "CONFIRMING..." : "CONFIRM APPOINTMENT"}
        </Button>
      </SheetContent>
    </Sheet>
  );
}
