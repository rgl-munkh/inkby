import type { AvailableDateEntry } from "../types";

export async function fetchArtistAvailability(): Promise<AvailableDateEntry[]> {
  const response = await fetch("/api/artist/availability");
  const data = await response.json();
  return data.availableDates ?? [];
}

export async function scheduleBookingRequest({
  requestId,
  durationMinutes,
  suggestedDates,
  lowAmount,
  highAmount,
  message,
}: {
  requestId: string;
  durationMinutes: number;
  suggestedDates: { datetime: string }[];
  lowAmount: number;
  highAmount: number;
  message?: string;
}): Promise<{ error: string | null }> {
  const res = await fetch(`/api/booking-requests/${requestId}/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      duration_minutes: durationMinutes,
      suggested_dates: suggestedDates,
      low_amount: lowAmount,
      high_amount: highAmount,
      message,
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    return { error: data.error ?? "Something went wrong" };
  }

  return { error: null };
}
