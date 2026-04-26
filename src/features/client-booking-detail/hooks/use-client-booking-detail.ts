"use client";

import { useState, useEffect } from "react";
import type { BookingRequest } from "../types";

export function useClientBookingDetail(id: string) {
  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("appointment");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);
  const [selectedDatetime, setSelectedDatetime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    fetch(`/api/booking-requests/${id}`)
      .then((r) => r.json())
      .then((data) => setBooking(data.booking_request ?? null))
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleConfirm(datetime?: string) {
    setConfirmError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/booking-requests/${id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datetime ? { chosen_datetime: datetime } : {}),
      });
      const data = await res.json();
      if (!res.ok) {
        setConfirmError(data.error ?? "Something went wrong");
        return;
      }
      setSheetOpen(false);
      const refreshed = await fetch(`/api/booking-requests/${id}`).then((r) => r.json());
      setBooking(refreshed.booking_request ?? null);
    } catch {
      setConfirmError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handlePaymentSuccess() {
    setBooking((prev) =>
      prev && prev.appointment
        ? { ...prev, appointment: { ...prev.appointment, status: "paid" } }
        : prev
    );
  }

  return {
    booking,
    loading,
    activeTab,
    setActiveTab,
    sheetOpen,
    setSheetOpen,
    paymentSheetOpen,
    setPaymentSheetOpen,
    selectedDatetime,
    setSelectedDatetime,
    submitting,
    confirmError,
    handleConfirm,
    handlePaymentSuccess,
  };
}
