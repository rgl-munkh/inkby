export const STATUS_BADGE: Record<string, string> = {
  scheduled: "Accepted",
  confirmed: "Confirmed",
  completed: "Done",
  cancelled: "Cancelled",
};

export const QA_FIELDS = [
  { label: "TELL ME MORE ABOUT YOUR IDEA", key: "ideaDescription" },
  { label: "WHAT SIZE ARE YOU THINKING?", key: "tattooSize" },
  { label: "WHERE ON YOUR BODY?", key: "placement" },
] as const;
