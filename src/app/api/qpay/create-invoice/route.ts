import { db } from "@/lib/db";
import { appointments, payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createInvoice } from "@/lib/qpay";
import { badRequest, notFound, serverError } from "@/lib/auth";
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
      columns: { id: true, status: true, artistId: true },
      with: {
        artist: { columns: { depositAmount: true, displayName: true } },
      },
    });

    if (!appointment) {
      return notFound("Appointment not found");
    }

    if (appointment.status !== "pending_payment") {
      return badRequest("Appointment is not awaiting payment");
    }

    const depositAmount = appointment.artist?.depositAmount;

    if (!depositAmount) {
      return serverError("Artist has not set a deposit amount");
    }

    const invoiceData = {
      invoice_code: "INKBY_DEPOSIT",
      sender_invoice_no: appointment.id,
      invoice_receiver_code: "",
      invoice_description: `Inkby Tattoo Deposit - ${appointment.artist?.displayName || "Artist"}`,
      amount: Number(depositAmount),
      callback_url: `${process.env.QPAY_CALLBACK_URL}?appointment_id=${appointment.id}`,
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
      amount: Number(depositAmount),
    });
  } catch (err) {
    console.error("QPAY create invoice error:", err);
    return serverError("Failed to create payment invoice");
  }
}
