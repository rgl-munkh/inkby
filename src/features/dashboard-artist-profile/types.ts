export type Artist = {
  id: string;
  slug: string | null;
  displayName: string | null;
  instagramUsername: string | null;
  avatarUrl: string | null;
  bio: string | null;
  depositAmount: string | null;
  studioLocation: string | null;
};

export type AvailableDate = {
  date: string;
  startTime: string;
  endTime: string;
};

export const PERIOD_TABS = ["TODAY", "WEEK", "MONTH", "YEAR"] as const;
export type Period = (typeof PERIOD_TABS)[number];
