import { db } from "@/lib/db";
import { appointments, payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createInvoice } from "@/lib/qpay";
import {
  badRequest,
  getAuthenticatedArtist,
  notFound,
  serverError,
  unauthorized,
} from "@/lib/auth";
import { getBookingTokenFromRequest, verifyBookingToken } from "@/lib/booking-token";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createInvoiceSchema = z.object({
  appointment_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, parsed.data.appointment_id),
      columns: { id: true, status: true, artistId: true, bookingRequestId: true },
      with: {
        artist: { columns: { depositAmount: true, displayName: true } },
      },
    });

    if (!appointment) {
      return notFound("Appointment not found");
    }

    // Authorize: the owning artist (session) or a valid per-booking token.
    const { user } = await getAuthenticatedArtist();
    const isArtist = !!user && user.id === appointment.artistId;
    const hasToken = verifyBookingToken(
      appointment.bookingRequestId,
      getBookingTokenFromRequest(request)
    );
    if (!isArtist && !hasToken) {
      return unauthorized();
    }

    if (appointment.status !== "pending_payment") {
      return badRequest("Appointment is not awaiting payment");
    }

    const depositAmount = Number(appointment.artist?.depositAmount ?? 0);

    if (!depositAmount || depositAmount <= 0) {
      return serverError("Artist has not set a deposit amount");
    }

    // Include the callback secret (when configured) so the callback can verify authenticity.
    const callbackSecret = process.env.QPAY_CALLBACK_SECRET;
    const callbackUrl = new URL(process.env.QPAY_CALLBACK_URL!);
    callbackUrl.searchParams.set("appointment_id", appointment.id);
    if (callbackSecret) {
      callbackUrl.searchParams.set("secret", callbackSecret);
    }

    const invoiceData = {
      invoice_code: process.env.QPAY_INVOICE_CODE ?? "INKBY_DEPOSIT",
      sender_invoice_no: appointment.id,
      invoice_receiver_code: "terminal",
      invoice_description: `Inkby Tattoo Deposit - ${appointment.artist?.displayName || "Artist"}`,
      amount: depositAmount,
      callback_url: callbackUrl.toString(),
    };

    const qpayResponse = await createInvoice(invoiceData);

    await db.insert(payments).values({
      appointmentId: appointment.id,
      qpayInvoiceId: qpayResponse.invoice_id,
      amount: String(depositAmount),
      status: "pending",
    });

    return NextResponse.json({
      invoice_id: qpayResponse.invoice_id,
      qr_text: qpayResponse.qr_text,
      qr_image: qpayResponse.qr_image,
      urls: qpayResponse.urls,
      amount: depositAmount,
    });
  } catch (err) {
    console.error("QPAY create invoice error:", err);
    return serverError("Failed to create payment invoice");
  }
}
