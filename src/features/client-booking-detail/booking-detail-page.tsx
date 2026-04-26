"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useClientBookingDetail } from "./hooks/use-client-booking-detail";
import { ClientBookingPageSkeleton } from "./components/page-skeleton";
import { ChooseTimeSheet } from "./components/choose-time-sheet";
import { PaymentSheet } from "./components/payment-sheet";
import { AppointmentTab } from "./components/appointment-tab";
import { CalendarIcon, QRIcon } from "./components/booking-detail-icons";

export default function ClientBookingPage() {
  const params = useParams();
  const id = params.id as string;

  const {
    booking,
    loading,
    activeTab,
    setActiveTab,
    sheetOpen,
    setSheetOpen,
    paymentSheetOpen,
    setPaymentSheetOpen,
    selectedDatetime,
    setSelectedDatetime,
    submitting,
    confirmError,
    handleConfirm,
    handlePaymentSuccess,
  } = useClientBookingDetail(id);

  if (loading) return <ClientBookingPageSkeleton />;

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-inkby-canvas">
        <p className="text-sm text-inkby-fg-muted">Booking not found.</p>
      </div>
    );
  }

  const artist = booking.artist;
  const artistHandle = artist.slug ? `@${artist.slug}` : artist.instagramUsername ? `@${artist.instagramUsername}` : "Artist";
  const artistName = artist.displayName ?? artistHandle;
  const schedule = booking.schedules[0] ?? null;
  const isPending = booking.status === "pending";
  const isScheduled = booking.status === "scheduled";
  const isConfirmed = booking.status === "confirmed";
  const allDatesSet = booking.schedules.every((s) => s.suggestedDatetime !== null);

  const appointment = booking.appointment ?? null;
  const isPendingPayment = isConfirmed && appointment?.status === "pending_payment";
  const isPaid = isConfirmed && appointment?.status === "paid";

  function openChooseTime(prefill: string | null) {
    setSelectedDatetime(prefill);
    setSheetOpen(true);
  }

  return (
    <div className="min-h-screen pb-28 bg-inkby-canvas">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-inkby-border">
            {artist.avatarUrl ? (
              <Image src={artist.avatarUrl} alt={artistName} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-inkby-fg-muted">
                {artistName.replace("@", "").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-inkby-fg">{artistHandle}</p>
            <p className="text-xs text-inkby-fg-muted">
              {typeof window !== "undefined" ? window.location.host : "inkby.mn"}/{artistHandle}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            variant="line"
            className="w-full h-auto justify-start gap-0 p-0 border-b rounded-none px-4"
            style={{ borderColor: "var(--inkby-border-medium)", background: "transparent" }}
          >
            {(["appointment", "chat"] as const).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="capitalize text-xs font-semibold tracking-wide px-4 py-2.5 rounded-none h-auto"
                style={{ color: activeTab === tab ? "var(--inkby-fg)" : "var(--inkby-fg-muted)" }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="appointment">
            <AppointmentTab
              booking={booking}
              isPending={isPending}
              isScheduled={isScheduled}
              isConfirmed={isConfirmed}
              isPaid={isPaid}
              isPendingPayment={isPendingPayment}
              schedule={schedule}
              artistHandle={artistHandle}
              artistName={artistName}
              onOpenChooseTime={openChooseTime}
            />
          </TabsContent>

          <TabsContent value="chat" className="px-4 pt-8 flex items-center justify-center">
            <p className="text-sm text-inkby-fg-muted">Coming soon</p>
          </TabsContent>
        </Tabs>
      </div>

      {(isScheduled || isPendingPayment) && (
        <div
          className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 z-20"
          style={{ background: "linear-gradient(to top, var(--inkby-canvas) 70%, transparent)" }}
        >
          <div className="max-w-lg mx-auto flex flex-col gap-2">
            {confirmError && (
              <p className="text-xs text-center text-inkby-error">{confirmError}</p>
            )}
            {isScheduled && (
              allDatesSet ? (
                <Button
                  onClick={() => void handleConfirm()}
                  disabled={submitting}
                  className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
                >
                  {submitting ? "CONFIRMING..." : "CONFIRM APPOINTMENT"}
                </Button>
              ) : (
                <Button
                  onClick={() => openChooseTime(null)}
                  className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
                >
                  <CalendarIcon />
                  CHOOSE A TIME
                </Button>
              )
            )}
            {isPendingPayment && appointment && (
              <Button
                onClick={() => setPaymentSheetOpen(true)}
                className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2"
                style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
              >
                <QRIcon />
                PAY DEPOSIT
              </Button>
            )}
          </div>
        </div>
      )}

      <ChooseTimeSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onConfirm={(dt) => void handleConfirm(dt)}
        submitting={submitting}
        error={confirmError}
        prefillDatetime={selectedDatetime}
      />

      {appointment && (
        <PaymentSheet
          open={paymentSheetOpen}
          onOpenChange={setPaymentSheetOpen}
          appointmentId={appointment.id}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
