export function formatAmount(raw: string | number): string {
  return Number(raw).toLocaleString("en-US");
}

export function formatAmountInput(raw: string): string {
  // Keep digits and a decimal point so numeric DB values like "20000.00"
  // are read as 20000 — not stripped to "2000000". Whole MNT only, so we
  // floor any fractional part before formatting.
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return "";
  const amount = Math.floor(Number(cleaned));
  if (!Number.isFinite(amount)) return "";
  return amount.toLocaleString("en-US");
}

export function parseAmountInput(formatted: string): number {
  return parseFloat(formatted.replace(/,/g, ""));
}
