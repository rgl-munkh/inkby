import { formatAmountInput, parseAmountInput } from "@/lib/domain/money";
import { parseDuration } from "@/lib/domain/duration";
import {
  DEFAULT_FLASH_DEAL_AMOUNTS,
  DEFAULT_FLASH_DEAL_DURATIONS,
  FLASH_DEAL_SIZE_OPTIONS,
  type FlashDealSheetDeal,
  type FlashDealSizeRowState,
  type SaveFlashDealBody,
} from "../types";

export function defaultFlashDealRows(): FlashDealSizeRowState[] {
  return FLASH_DEAL_SIZE_OPTIONS.map((_, i) => ({
    enabled: true,
    duration: DEFAULT_FLASH_DEAL_DURATIONS[i],
    amount: formatAmountInput(DEFAULT_FLASH_DEAL_AMOUNTS[i]),
  }));
}

function minutesToDurationInput(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function rowsFromFlashDeal(deal: FlashDealSheetDeal): FlashDealSizeRowState[] {
  return FLASH_DEAL_SIZE_OPTIONS.map((size, i) => {
    const expected = `${size.label} (${size.sublabel})`;
    const row = deal.sizes.find((item) => item.sizeLabel === expected);
    const defaultDuration = DEFAULT_FLASH_DEAL_DURATIONS[i];
    const defaultAmount = formatAmountInput(DEFAULT_FLASH_DEAL_AMOUNTS[i]);

    if (!row) {
      return { enabled: false, duration: defaultDuration, amount: defaultAmount };
    }

    const durationMinutes = row.durationMinutes;
    return {
      enabled: true,
      duration:
        durationMinutes != null && durationMinutes > 0
          ? minutesToDurationInput(durationMinutes)
          : defaultDuration,
      amount: formatAmountInput(String(row.estimatedAmount)),
    };
  });
}

export function buildFlashDealPayload({
  photoUrl,
  title,
  description,
  isRepeatable,
  isActive,
  isEdit,
  rows,
}: {
  photoUrl: string;
  title: string;
  description: string;
  isRepeatable: boolean;
  isActive: boolean;
  isEdit: boolean;
  rows: FlashDealSizeRowState[];
}): { body: SaveFlashDealBody; error: null } | { body: null; error: string } {
  if (!photoUrl) {
    return { body: null, error: isEdit ? "Photo is missing" : "Upload a photo" };
  }

  const enabled = rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row.enabled);

  if (enabled.length === 0) {
    return { body: null, error: "Enable at least one size" };
  }

  const sizes: SaveFlashDealBody["sizes"] = [];

  for (const { row, index } of enabled) {
    const minutes = parseDuration(row.duration);
    const size = FLASH_DEAL_SIZE_OPTIONS[index];

    if (!minutes) {
      return {
        body: null,
        error: `Invalid duration for ${size.label}. Use e.g. 1h30m, 2h, 45m`,
      };
    }

    const amount = parseAmountInput(row.amount);
    if (!row.amount.trim() || isNaN(amount) || amount <= 0) {
      return { body: null, error: `Enter a valid estimate for ${size.label}` };
    }

    sizes.push({
      size_label: `${size.label} (${size.sublabel})`,
      estimated_amount: amount,
      duration_minutes: minutes,
    });
  }

  return {
    body: {
      photo_url: photoUrl,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      is_repeatable: isRepeatable,
      sizes,
      ...(isEdit ? { is_active: isActive } : {}),
    },
    error: null,
  };
}
