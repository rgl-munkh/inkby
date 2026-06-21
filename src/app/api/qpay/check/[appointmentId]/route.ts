import { db } from "@/lib/db";
import { appointments, payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  getAuthenticatedArtist,
  notFound,
  serverError,
  unauthorized,
} from "@/lib/auth";
import { getBookingTokenFromRequest, verifyBookingToken } from "@/lib/booking-token";
import { checkPayment } from "@/lib/qpay";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;

    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, appointmentId),
      columns: { id: true, artistId: true, bookingRequestId: true },
    });

    if (!appointment) {
      return notFound("Payment not found");
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

    const payment = await db.query.payments.findFirst({
      where: eq(payments.appointmentId, appointmentId),
      columns: { id: true, amount: true, status: true, paidAt: true, qpayInvoiceId: true },
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });

    if (!payment) {
      return notFound("Payment not found");
    }

    if (payment.status === "pending" && payment.qpayInvoiceId) {
      const qpayResult = await checkPayment(payment.qpayInvoiceId);

      const expectedAmount = Number(payment.amount);
      if (qpayResult.count > 0 && qpayResult.paid_amount >= expectedAmount) {
        await db.transaction(async (tx) => {
          await tx
            .update(payments)
            .set({ status: "paid", paidAt: new Date() })
            .where(eq(payments.id, payment.id));

          await tx
            .update(appointments)
            .set({ status: "paid" })
            .where(eq(appointments.id, appointmentId));
        });

        return NextResponse.json({
          payment: { ...payment, status: "paid", paidAt: new Date(), qpayInvoiceId: undefined },
        });
      }
    }

    const { qpayInvoiceId: _, ...paymentData } = payment;
    return NextResponse.json({ payment: paymentData });
  } catch {
    return serverError();
  }
}
