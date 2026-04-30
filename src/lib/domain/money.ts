export function formatAmount(raw: string | number): string {
  return Number(raw).toLocaleString("en-US");
}

export function formatAmountInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

export function parseAmountInput(formatted: string): number {
  return parseFloat(formatted.replace(/,/g, ""));
}
