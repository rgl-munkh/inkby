export function parseDuration(str: string): number | null {
  const clean = str.trim().toLowerCase();
  const full = clean.match(/^(\d+)h(\d+)m?$/);
  if (full) return parseInt(full[1], 10) * 60 + parseInt(full[2], 10);
  const hoursOnly = clean.match(/^(\d+)h$/);
  if (hoursOnly) return parseInt(hoursOnly[1], 10) * 60;
  const minsOnly = clean.match(/^(\d+)m?$/);
  if (minsOnly) return parseInt(minsOnly[1], 10);
  return null;
}

export function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""}`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h} hour${h > 1 ? "s" : ""}`;
}
