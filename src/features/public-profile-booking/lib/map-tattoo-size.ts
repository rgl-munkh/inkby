import { SIZES } from "../constants";

/** Maps a wizard size `value` to the API `tattoo_size` enum. */
export function mapTattooSizeToApi(
  size: string
): "small" | "medium" | "large" | "extra-large" {
  return SIZES.find((s) => s.value === size)?.api ?? "medium";
}
