export type SizeOption = {
  value: string;
  label: string;
  emoji: string;
  api: "small" | "medium" | "large" | "extra-large";
};

export const SIZES: readonly SizeOption[] = [
  { value: "credit_card", label: "Size of a credit card", emoji: "💳", api: "small" },
  { value: "palm", label: "Palm-sized", emoji: "✊", api: "medium" },
  { value: "hand", label: "Hand-sized", emoji: "🖐", api: "large" },
  { value: "larger", label: "Half sleeve or larger", emoji: "😎", api: "extra-large" },
  { value: "undecided", label: "Haven't decided yet", emoji: "🧐", api: "medium" },
] as const;

export type BodySide = "front" | "back";

// Maps each interactive body-region key to a human-readable placement label.
// The label is what gets stored as the booking's `placement`, so the artist
// dashboard's raw display stays clean.
export const PLACEMENT_LABELS: Record<string, string> = {
  // ── Front ──────────────────────────────────────────────
  "front-head": "Head (front)",
  "front-neck": "Neck (front)",
  "front-chest-left": "Left chest (front)",
  "front-chest-right": "Right chest (front)",
  "front-abdomen": "Abdomen (front)",
  "front-groin": "Groin (front)",
  "front-hip-left": "Left hip (front)",
  "front-hip-right": "Right hip (front)",
  "front-upper-arm-left": "Left upper arm (front)",
  "front-upper-arm-right": "Right upper arm (front)",
  "front-elbow-left": "Left elbow (front)",
  "front-elbow-right": "Right elbow (front)",
  "front-forearm-left": "Left forearm (front)",
  "front-forearm-right": "Right forearm (front)",
  "front-hand-left": "Left hand (front)",
  "front-hand-right": "Right hand (front)",
  "front-thigh-left": "Left thigh (front)",
  "front-thigh-right": "Right thigh (front)",
  "front-knee-left": "Left knee (front)",
  "front-knee-right": "Right knee (front)",
  "front-shin-left": "Left shin (front)",
  "front-shin-right": "Right shin (front)",
  "front-foot-left": "Left foot (front)",
  "front-foot-right": "Right foot (front)",
  // ── Back ───────────────────────────────────────────────
  "back-head": "Head (back)",
  "back-neck": "Neck (back)",
  "back-shoulderblade-left": "Left shoulder blade (back)",
  "back-shoulderblade-right": "Right shoulder blade (back)",
  "back-loin-left": "Left lower back",
  "back-loin-right": "Right lower back",
  "back-buttock-left": "Left buttock (back)",
  "back-buttock-right": "Right buttock (back)",
  "back-upper-arm-left": "Left upper arm (back)",
  "back-upper-arm-right": "Right upper arm (back)",
  "back-elbow-left": "Left elbow (back)",
  "back-elbow-right": "Right elbow (back)",
  "back-forearm-left": "Left forearm (back)",
  "back-forearm-right": "Right forearm (back)",
  "back-hand-left": "Left hand (back)",
  "back-hand-right": "Right hand (back)",
  "back-thigh-left": "Left thigh (back)",
  "back-thigh-right": "Right thigh (back)",
  "back-knee-left": "Left knee (back)",
  "back-knee-right": "Right knee (back)",
  "back-calf-left": "Left calf (back)",
  "back-calf-right": "Right calf (back)",
  "back-foot-left": "Left foot (back)",
  "back-foot-right": "Right foot (back)",
};
