import { db } from "@/lib/db";
import { appointments, payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, serverError } from "@/lib/auth";
import { checkPayment } from "@/lib/qpay";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;

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

      if (qpayResult.count > 0 && qpayResult.paid_amount > 0) {
        await db
          .update(payments)
          .set({ status: "paid", paidAt: new Date() })
          .where(eq(payments.id, payment.id));

        await db
          .update(appointments)
          .set({ status: "paid" })
          .where(eq(appointments.id, appointmentId));

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
