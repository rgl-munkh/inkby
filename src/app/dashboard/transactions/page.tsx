import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { payments, appointments, bookingRequests } from "@/lib/db/schema";
import { eq, and, gte, lt, desc, sum } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { TransactionsView } from "@/features/dashboard-transactions/transactions-view";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [rows, earningsResult] = await Promise.all([
    db
      .select({
        id: payments.id,
        amount: payments.amount,
        status: payments.status,
        paidAt: payments.paidAt,
        createdAt: payments.createdAt,
        firstName: bookingRequests.firstName,
        lastName: bookingRequests.lastName,
        appointmentId: appointments.id,
        chosenDatetime: appointments.chosenDatetime,
      })
      .from(payments)
      .innerJoin(appointments, eq(payments.appointmentId, appointments.id))
      .innerJoin(bookingRequests, eq(appointments.bookingRequestId, bookingRequests.id))
      .where(eq(appointments.artistId, user.id))
      .orderBy(desc(payments.createdAt)),
    db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .innerJoin(appointments, eq(payments.appointmentId, appointments.id))
      .where(
        and(
          eq(appointments.artistId, user.id),
          eq(payments.status, "paid"),
          gte(payments.paidAt, monthStart),
          lt(payments.paidAt, monthEnd)
        )
      ),
  ]);

  return (
    <TransactionsView
      initialTransactions={JSON.parse(JSON.stringify(rows))}
      initialEarnings={Number(earningsResult[0]?.total ?? 0)}
    />
  );
}
