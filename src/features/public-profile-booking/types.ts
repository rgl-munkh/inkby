export type Artist = {
  id: string;
  slug: string;
  displayName: string | null;
  instagramUsername: string | null;
  depositAmount: string | null;
  avatarUrl: string | null;
  bio: string | null;
};

export type FlashSize = {
  id: string;
  sizeLabel: string;
  estimatedAmount: string;
  durationMinutes: number | null;
};

export type FlashDeal = {
  id: string;
  photoUrl: string;
  title: string | null;
  isRepeatable: boolean;
  sizes: FlashSize[];
};
