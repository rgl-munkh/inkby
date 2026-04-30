"use client";

import { useEffect, useState } from "react";
import { parseAmountInput } from "@/lib/domain/money";
import { parseDuration } from "@/lib/domain/duration";
import {
  fetchArtistAvailability,
  scheduleBookingRequest,
} from "../services/schedule-service";
import type { AvailableDateEntry, ScheduleSheetBookingRequest } from "../types";

export function useScheduleRequestForm({
  open,
  onOpenChange,
  onScheduled,
  request,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onScheduled: () => void;
  request: ScheduleSheetBookingRequest;
}) {
  const [duration, setDuration] = useState("1h30m");
  const [lowAmount, setLowAmount] = useState("");
  const [highAmount, setHighAmount] = useState("");
  const [dates, setDates] = useState<string[]>([""]);
  const [message, setMessage] = useState(
    `Hey ${request.firstName}, I'm so excited to work with you on this! Let me know if the dates work, if not we can find other times`,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [availableDates, setAvailableDates] = useState<AvailableDateEntry[]>([]);

  useEffect(() => {
    if (!open) return;
    fetchArtistAvailability()
      .then(setAvailableDates)
      .catch(() => setAvailableDates([]));
  }, [open]);

  function addDate() {
    setDates((prev) => [...prev, ""]);
  }

  function removeDate(index: number) {
    setDates((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  }

  function updateDate(index: number, value: string) {
    setDates((prev) =>
      prev.map((date, rowIndex) => (rowIndex === index ? value : date)),
    );
  }

  async function handleSubmit() {
    setError("");
    const durationMinutes = parseDuration(duration);
    if (!durationMinutes) {
      setError("Invalid duration. Use format like 1h30m, 2h, or 45m");
      return;
    }

    const low = parseAmountInput(lowAmount);
    const high = parseAmountInput(highAmount);
    if (!lowAmount || isNaN(low) || low <= 0) {
      setError("Enter a valid low estimate");
      return;
    }
    if (!highAmount || isNaN(high) || high <= 0) {
      setError("Enter a valid high estimate");
      return;
    }
    if (high < low) {
      setError("High estimate must be greater than or equal to low");
      return;
    }

    const suggestedDates = dates
      .filter(Boolean)
      .map((date) => ({ datetime: new Date(date).toISOString() }));

    setSubmitting(true);
    try {
      const result = await scheduleBookingRequest({
        requestId: request.id,
        durationMinutes,
        suggestedDates,
        lowAmount: low,
        highAmount: high,
        message: message.trim() || undefined,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      onOpenChange(false);
      onScheduled();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    addDate,
    availableDates,
    dates,
    duration,
    error,
    handleSubmit,
    highAmount,
    lowAmount,
    message,
    removeDate,
    setDuration,
    setHighAmount,
    setLowAmount,
    setMessage,
    submitting,
    updateDate,
  };
}
