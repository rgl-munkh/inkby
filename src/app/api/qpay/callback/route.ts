import { db } from "@/lib/db";
import { appointments, payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkPayment } from "@/lib/qpay";
import { badRequest, serverError } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get("appointment_id");

    // Verify callback authenticity when a secret is configured.
    const expectedSecret = process.env.QPAY_CALLBACK_SECRET;
    if (expectedSecret && searchParams.get("secret") !== expectedSecret) {
      return badRequest("Invalid callback secret");
    }

    if (!appointmentId) {
      return badRequest("appointment_id is required");
    }

    const payment = await db.query.payments.findFirst({
      where: eq(payments.appointmentId, appointmentId),
      columns: { id: true, qpayInvoiceId: true, status: true, amount: true },
    });

    if (!payment) {
      return badRequest("Payment record not found");
    }

    if (payment.status === "paid") {
      return NextResponse.json({ message: "Already paid" });
    }

    if (!payment.qpayInvoiceId) {
      return badRequest("No QPAY invoice associated");
    }

    const qpayResult = await checkPayment(payment.qpayInvoiceId);

    // Trust QPay's reported paid_amount (not the callback body), and require the
    // full expected deposit — reject partial/underpayment.
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

      return NextResponse.json({ message: "Payment confirmed", status: "paid" });
    }

    return NextResponse.json({ message: "Payment not yet received", status: "pending" });
  } catch (err) {
    console.error("QPAY callback error:", err);
    return serverError("Payment verification failed");
  }
}
