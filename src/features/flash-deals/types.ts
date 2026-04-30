export const FLASH_DEAL_SIZE_OPTIONS = [
  { label: "X-Small", sublabel: "Under 2.5 cm" },
  { label: "Small", sublabel: "2.5–8 cm" },
  { label: "Medium", sublabel: "8–10 cm" },
  { label: "Large", sublabel: "13–15 cm" },
  { label: "X-Large", sublabel: "18+ cm" },
] as const;

export const DEFAULT_FLASH_DEAL_DURATIONS = [
  "1h30m",
  "2h",
  "2h30m",
  "3h",
  "3h30m",
] as const;

export const DEFAULT_FLASH_DEAL_AMOUNTS = [
  "150000",
  "175000",
  "200000",
  "225000",
  "250000",
] as const;

export type FlashDealSizeRowState = {
  enabled: boolean;
  duration: string;
  amount: string;
};

export type FlashDealSheetDeal = {
  id: string;
  photoUrl: string;
  title: string | null;
  description: string | null;
  isRepeatable: boolean;
  isActive: boolean;
  sizes: {
    id: string;
    sizeLabel: string;
    estimatedAmount: string;
    durationMinutes: number | null;
  }[];
};

export type SaveFlashDealBody = {
  photo_url: string;
  title?: string;
  description?: string;
  is_repeatable: boolean;
  is_active?: boolean;
  sizes: {
    size_label: string;
    estimated_amount: number;
    duration_minutes?: number;
  }[];
};
