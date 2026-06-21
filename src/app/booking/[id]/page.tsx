import { Suspense } from "react";
import ClientBookingPage from "@/features/client-booking-detail/booking-detail-page";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientBookingPage />
    </Suspense>
  );
}
