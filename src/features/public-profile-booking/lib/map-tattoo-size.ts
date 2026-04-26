/** Maps wizard pill label to API `tattoo_size` enum (unchanged from original inline logic). */
export function mapTattooSizeToApi(size: string): "small" | "medium" | "large" | "extra-large" {
  if (size === "1-2 INCHES") return "small";
  if (size === "3-4 INCHES") return "medium";
  if (size === "5-6 INCHES") return "large";
  return "extra-large";
}
