"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { BookingRequest } from "../types";

export function useClientBookingDetail(id: string, token?: string | null) {
  // Per-booking access token (from the booking link) sent with every request.
  const authHeaders = useMemo<Record<string, string>>(() => {
    const h: Record<string, string> = {};
    if (token) h["x-booking-token"] = token;
    return h;
  }, [token]);

  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("appointment");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);
  const [selectedDatetime, setSelectedDatetime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  // Reschedule / cancel (post-confirmation) state
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  const refresh = useCallback(async () => {
    const data = await fetch(`/api/booking-requests/${id}`, {
      headers: authHeaders,
    }).then((r) => r.json());
    setBooking(data.booking_request ?? null);
  }, [id, authHeaders]);

  useEffect(() => {
    fetch(`/api/booking-requests/${id}`, { headers: authHeaders })
      .then((r) => r.json())
      .then((data) => setBooking(data.booking_request ?? null))
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [id, authHeaders]);

  async function handleConfirm(datetime?: string) {
    setConfirmError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/booking-requests/${id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(datetime ? { chosen_datetime: datetime } : {}),
      });
      const data = await res.json();
      if (!res.ok) {
        setConfirmError(data.error ?? "Something went wrong");
        return;
      }
      setSheetOpen(false);
      await refresh();
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

  async function handleReschedule(datetime: string) {
    const appointmentId = booking?.appointment?.id;
    if (!appointmentId) return;
    setActionError("");
    setActionSubmitting(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ chosen_datetime: datetime }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Something went wrong");
        return;
      }
      setRescheduleOpen(false);
      await refresh();
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleCancel(reason?: string) {
    const appointmentId = booking?.appointment?.id;
    if (!appointmentId) return;
    setActionError("");
    setActionSubmitting(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(reason ? { reason } : {}),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Something went wrong");
        return;
      }
      setCancelOpen(false);
      await refresh();
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setActionSubmitting(false);
    }
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
    // reschedule / cancel
    rescheduleOpen,
    setRescheduleOpen,
    cancelOpen,
    setCancelOpen,
    actionSubmitting,
    actionError,
    handleReschedule,
    handleCancel,
  };
}
