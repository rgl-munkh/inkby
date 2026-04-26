import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col">
      <div className="flex lg:hidden items-center justify-between px-4 py-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-28 h-8 rounded-full" />
      </div>
      <div className="px-2 lg:px-4 pt-4 lg:max-w-xl mx-auto lg:px-6 lg:pt-6 w-full">
        <div className="flex gap-0 border-b mb-4" style={{ borderColor: "var(--inkby-border-medium)" }}>
          {["REQUESTS", "ACCEPTED", "UPCOMING", "PAST"].map((label) => (
            <div key={label} className="px-3 sm:px-4 py-2.5">
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 w-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-inkby-surface">
              <Skeleton className="w-full h-48" />
              <div className="p-4 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
