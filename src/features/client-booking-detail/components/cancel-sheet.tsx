"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export function CancelSheet({
  open,
  onOpenChange,
  onConfirm,
  submitting,
  error,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (reason: string) => void;
  submitting: boolean;
  error: string;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset field when sheet opens
    if (open) setReason("");
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-xl border-border p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] flex flex-col gap-5"
      >
        <SheetHeader className="p-0 pr-8">
          <SheetTitle className="text-base font-semibold text-left text-foreground">
            Cancel appointment?
          </SheetTitle>
          <SheetDescription className="text-xs text-left text-muted-foreground">
            This frees up your slot. Your deposit is non-refundable.
          </SheetDescription>
        </SheetHeader>

        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          rows={3}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
          style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}
        />

        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Button
            onClick={() => onConfirm(reason.trim())}
            disabled={submitting}
            className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer"
            style={{ background: "var(--destructive)", color: "var(--card)" }}
          >
            {submitting ? "CANCELLING..." : "CANCEL APPOINTMENT"}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer bg-transparent text-muted-foreground"
          >
            KEEP IT
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
