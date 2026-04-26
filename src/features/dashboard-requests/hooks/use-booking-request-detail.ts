"use client";

import { useState, useEffect, useCallback } from "react";
import type { BookingRequest } from "../types";

export function useBookingRequestDetail(id: string) {
  const [request, setRequest] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const runFetch = useCallback((showLoading: boolean) => {
    if (showLoading) setLoading(true);
    setFetchError(false);
    fetch(`/api/booking-requests/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => setRequest(data.booking_request ?? null))
      .catch(() => { setRequest(null); setFetchError(true); })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    // Initial load: avoid synchronous setLoading(true) (already true); fetch still updates request/error.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runFetch(false);
  }, [runFetch]);

  const fetchRequest = useCallback(() => runFetch(true), [runFetch]);
  const refetchAfterSchedule = fetchRequest;

  return { request, loading, fetchError, fetchRequest, refetchAfterSchedule };
}
