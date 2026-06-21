import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

// Clients have no accounts. Access to a booking (view / confirm / reschedule /
// cancel / pay) is gated by a signed, scoped token derived from the booking
// request id, embedded in the link we hand the client. This replaces using the
// raw resource UUID as a bearer credential.

function getSecret(): string {
  const secret = process.env.BOOKING_TOKEN_SECRET;
  if (!secret) {
    throw new Error("BOOKING_TOKEN_SECRET is not set");
  }
  return secret;
}

export function signBookingToken(bookingRequestId: string): string {
  return createHmac("sha256", getSecret())
    .update(bookingRequestId)
    .digest("base64url");
}

export function verifyBookingToken(
  bookingRequestId: string,
  token: string | null | undefined
): boolean {
  if (!token) return false;
  let expected: string;
  try {
    expected = signBookingToken(bookingRequestId);
  } catch {
    return false;
  }
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Token is accepted from the `t` query param (links) or the `x-booking-token`
// header (programmatic clients).
export function getBookingTokenFromRequest(request: NextRequest): string | null {
  return (
    new URL(request.url).searchParams.get("t") ??
    request.headers.get("x-booking-token")
  );
}
