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

    if (!appointmentId) {
      return badRequest("appointment_id is required");
    }

    const payment = await db.query.payments.findFirst({
      where: eq(payments.appointmentId, appointmentId),
      columns: { id: true, qpayInvoiceId: true, status: true },
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

    console.log({ qpayResult })

    if (qpayResult.count > 0 && qpayResult.paid_amount > 0) {
      await db
        .update(payments)
        .set({ status: "paid", paidAt: new Date() })
        .where(eq(payments.id, payment.id));

      await db
        .update(appointments)
        .set({ status: "paid" })
        .where(eq(appointments.id, appointmentId));

      return NextResponse.json({ message: "Payment confirmed", status: "paid" });
    }

    return NextResponse.json({ message: "Payment not yet received", status: "pending" });
  } catch (err) {
    console.error("QPAY callback error:", err);
    return serverError("Payment verification failed");
  }
}
