export type Transaction = {
  id: string;
  amount: string;
  status: "pending" | "paid" | "failed";
  paidAt: string | null;
  createdAt: string;
  firstName: string;
  lastName: string;
  appointmentId: string;
  chosenDatetime: string;
};

export const PERIOD_TABS = ["TODAY", "WEEK", "MONTH", "YEAR"] as const;
export type Period = (typeof PERIOD_TABS)[number];

export const PERIOD_MAP: Record<Period, string> = {
  TODAY: "today",
  WEEK: "week",
  MONTH: "month",
  YEAR: "year",
};

export const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  paid: { label: "Paid", bg: "var(--muted)", color: "var(--foreground)" },
  pending: { label: "Pending", bg: "#f97316", color: "var(--card)" },
  failed: { label: "Failed", bg: "var(--destructive)", color: "var(--card)" },
};
