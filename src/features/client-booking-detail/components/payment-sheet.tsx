"use client";

import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { formatAmount } from "@/lib/utils";
import { PAYMENT_POLL_MS, PAYMENT_REDIRECT_DELAY_MS } from "@/lib/constants";
import type { QPayInvoice } from "../types";
import { CheckCircleIcon, QRIcon } from "./booking-detail-icons";

export function PaymentSheet({
  open,
  onOpenChange,
  appointmentId,
  onPaymentSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  appointmentId: string;
  onPaymentSuccess: () => void;
}) {
  const [invoice, setInvoice] = useState<QPayInvoice | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "checking">("pending");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) {
      setInvoice(null);
      setInvoiceError("");
      setPaymentStatus("pending");
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    async function fetchInvoice() {
      setLoadingInvoice(true);
      setInvoiceError("");
      try {
        const res = await fetch("/api/qpay/create-invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointment_id: appointmentId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setInvoiceError(data.error ?? "Failed to create payment. Please try again.");
          return;
        }
        setInvoice(data as QPayInvoice);
        startPolling(appointmentId);
      } catch {
        setInvoiceError("Network error. Please try again.");
      } finally {
        setLoadingInvoice(false);
      }
    }

    void fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointmentId]);

  function startPolling(apptId: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        setPaymentStatus("checking");
        const res = await fetch(`/api/qpay/check/${apptId}`);
        const data = await res.json();
        if (res.ok && data.payment?.status === "paid") {
          clearInterval(pollRef.current!);
          setPaymentStatus("paid");
          setTimeout(() => {
            onOpenChange(false);
            onPaymentSuccess();
          }, PAYMENT_REDIRECT_DELAY_MS);
        } else {
          setPaymentStatus("pending");
        }
      } catch {
        setPaymentStatus("pending");
      }
    }, PAYMENT_POLL_MS);
  }

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl p-6 flex flex-col gap-5 max-h-[90dvh] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-base font-semibold text-left text-inkby-fg">
            Pay deposit
          </SheetTitle>
          <SheetDescription className="text-xs text-left text-inkby-fg-muted">
            Scan the QR code or open your bank app to pay the deposit and lock in your appointment.
          </SheetDescription>
        </SheetHeader>

        {loadingInvoice && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Skeleton className="w-48 h-48 rounded-2xl" />
            <Skeleton className="h-4 w-24" />
            <div className="grid grid-cols-2 gap-2 w-full pt-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-11 rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {invoiceError && !loadingInvoice && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-inkby-error">{invoiceError}</p>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="rounded-full text-xs"
            >
              Close
            </Button>
          </div>
        )}

        {paymentStatus === "paid" && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="text-inkby-success"><CheckCircleIcon size={48} /></span>
            <p className="text-base font-semibold text-inkby-fg">Deposit paid!</p>
            <p className="text-xs text-inkby-fg-muted">Your appointment is confirmed.</p>
          </div>
        )}

        {invoice && paymentStatus !== "paid" && !loadingInvoice && (
          <>
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-inkby-surface-soft">
              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-inkby-fg-placeholder">
                  Deposit amount
                </p>
                <p className="text-xl font-bold mt-0.5 text-inkby-fg">
                  ₮{formatAmount(invoice.amount)}
                </p>
              </div>
              <span className="text-inkby-fg-placeholder"><QRIcon /></span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div
                className="rounded-2xl overflow-hidden p-3"
                style={{ background: "var(--inkby-surface)", border: "1px solid var(--inkby-border)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${invoice.qr_image}`}
                  alt="QPay QR code"
                  width={192}
                  height={192}
                  className="w-48 h-48 object-contain"
                />
              </div>
              <p className="text-[10px] text-inkby-fg-placeholder">
                {paymentStatus === "checking" ? "Checking payment..." : "Waiting for payment..."}
              </p>
            </div>

            {invoice.urls && invoice.urls.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-inkby-fg-placeholder">
                  Or open your bank app
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {invoice.urls.map((bank) => (
                    <a
                      key={bank.name}
                      href={bank.link}
                      className="flex items-center gap-2 px-3 h-11 rounded-xl text-xs font-medium transition-opacity hover:opacity-75 active:opacity-60"
                      style={{ background: "var(--inkby-surface-soft)", color: "var(--inkby-fg)" }}
                    >
                      {bank.logo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={bank.logo}
                          alt=""
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded object-contain shrink-0"
                        />
                      )}
                      <span className="truncate">{bank.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
