"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useBookingRequestDetail } from "./hooks/use-booking-request-detail";
import { AppointmentDetailsCard } from "./components/appointment-details-card";
import { DetailSkeleton } from "./components/detail-skeleton";
import {
  BackIconNav,
  DownloadIcon,
  ShareIcon,
  NoteIcon,
} from "./components/request-detail-icons";
import { QA_FIELDS } from "./constants";
import type { BookingRequest } from "./types";
import { ScheduleSheet } from "./schedule-sheet";

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { request, loading, fetchError, fetchRequest, refetchAfterSchedule } = useBookingRequestDetail(id);
  const [activeTab, setActiveTab] = useState("appointment");
  const [sheetOpen, setSheetOpen] = useState(false);

  const photo = request?.photos?.[0]?.photoUrl;
  const latestSchedule = request?.schedules?.[0] ?? null;
  const isPending = request?.status === "pending";

  function handleDownload() {
    if (!photo) return;
    const a = document.createElement("a");
    a.href = photo;
    a.download = "reference.jpg";
    a.target = "_blank";
    a.click();
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col min-h-screen bg-background">
      <div
        className="sticky top-0 z-20 flex items-center px-2 py-3 gap-2 bg-background"
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-opacity hover:opacity-60 cursor-pointer shrink-0 text-foreground"
          aria-label="Go back"
        >
          <BackIconNav />
        </button>
        <h1 className="flex-1 text-center text-sm font-semibold pr-9 truncate text-foreground">
          {loading ? (
            <Skeleton className="h-4 w-32 mx-auto" />
          ) : (
            `${request?.firstName ?? ""} ${request?.lastName ?? ""}`.trim() || "Request"
          )}
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
        <TabsList
          variant="line"
          className="w-full h-auto justify-start gap-0 p-0 border-b rounded-none shrink-0 px-4"
          style={{ borderColor: "var(--border)", background: "var(--background)" }}
        >
          {(["appointment", "payment", "chat"] as const).map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="capitalize text-xs font-semibold tracking-wide px-4 py-2.5 rounded-none h-auto"
              style={{ color: activeTab === tab ? "var(--foreground)" : "var(--muted-foreground)" }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="appointment" className="flex-1 pb:4 lg:pb-28">
          {loading ? (
            <DetailSkeleton />
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <p className="text-sm font-semibold text-foreground">Failed to load request</p>
              <button
                onClick={fetchRequest}
                className="text-xs font-semibold underline text-muted-foreground cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : !request ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">Request not found.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="relative w-full h-72 bg-muted">
                {photo ? (
                  <Image src={photo} alt="Reference" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#b0aca6" strokeWidth="1.5" />
                      <circle cx="8.5" cy="8.5" r="1.5" stroke="#b0aca6" strokeWidth="1.5" />
                      <path d="M21 15l-5-5L5 21" stroke="#b0aca6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                {photo && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={handleDownload}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-70 cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.85)", color: "var(--foreground)" }}
                      aria-label="Download photo"
                    >
                      <DownloadIcon />
                    </button>
                    <button
                      onClick={() => navigator.share?.({ url: photo })}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-70 cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.85)", color: "var(--foreground)" }}
                      aria-label="Share photo"
                    >
                      <ShareIcon />
                    </button>
                  </div>
                )}
              </div>

              <div className="px-4 pt-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm text-foreground">
                    {request.ideaDescription}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-muted-foreground">#{request.placement}</span>
                    <span className="text-xs font-medium text-muted-foreground">#{request.tattooSize}</span>
                    <span
                      className="text-xs rounded-full px-2.5 py-0.5 font-medium"
                      style={{ background: "var(--border)", color: "var(--muted-foreground)" }}
                    >
                      Custom
                    </span>
                  </div>
                </div>

                {isPending ? (
                  <>
                    <div className="rounded-2xl p-4 flex flex-col gap-1 bg-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground"><NoteIcon /></span>
                          <span className="text-sm font-semibold text-foreground">Private notes</span>
                        </div>
                        <button
                          className="text-xs font-semibold tracking-widest uppercase transition-opacity hover:opacity-60 cursor-pointer text-muted-foreground"
                        >
                          ADD
                        </button>
                      </div>
                      {latestSchedule?.privateNote ? (
                        <p className="text-xs mt-1 text-muted-foreground">
                          {latestSchedule.privateNote}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Not visible to clients</p>
                      )}
                    </div>

                    <div className="rounded-2xl overflow-hidden bg-card">
                      <div className="px-4 pt-4 pb-2">
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                          Additional Questions
                        </p>
                      </div>
                      <div className="flex flex-col divide-y" style={{ borderColor: "var(--muted)" }}>
                        {QA_FIELDS.map(({ label, key }) => (
                          <div key={key} className="px-4 py-3 flex flex-col gap-0.5">
                            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                              {label}
                            </p>
                            <p className="text-sm text-foreground">
                              {request[key as keyof BookingRequest] as string}
                            </p>
                          </div>
                        ))}
                        <div className="px-4 py-3 flex flex-col gap-0.5">
                          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                            CONTACT
                          </p>
                          <p className="text-sm text-foreground">{request.email}</p>
                          <p className="text-sm text-muted-foreground">{request.phone}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <AppointmentDetailsCard request={request} schedule={latestSchedule} />
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="payment" className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </TabsContent>

        <TabsContent value="chat" className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </TabsContent>
      </Tabs>

      {!loading && request && (
        <div
          className="lg:mx-auto lg:max-w-xl lg:fixed bottom-0 left-0 right-0 lg:left-44 px-4 pb-6 pt-3 z-20"
          style={{ background: "linear-gradient(to top, var(--background) 70%, transparent)" }}
        >
          <Button
            onClick={() => setSheetOpen(true)}
            className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer"
            style={{ background: "var(--foreground)", color: "var(--card)" }}
          >
            {isPending ? "SCHEDULE" : "EDIT APPOINTMENT"}
          </Button>
        </div>
      )}

      {request && (
        <ScheduleSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          request={request}
          onScheduled={() => {
            refetchAfterSchedule();
          }}
        />
      )}
    </div>
  );
}
