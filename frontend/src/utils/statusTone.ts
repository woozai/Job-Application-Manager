export const statusTones = ["positive", "warning", "negative", "neutral", "info"] as const;

export type StatusTone = (typeof statusTones)[number];

export const defaultStatusTone: StatusTone = "neutral";

export function getSafeStatusTone(tone: StatusTone | null | undefined): StatusTone {
  return tone && statusTones.includes(tone) ? tone : defaultStatusTone;
}

export function formatStatusLabel(
  value: string | null | undefined,
  fallback = "Not set",
) {
  const trimmedValue = value?.trim();
  return trimmedValue && trimmedValue.length > 0 ? trimmedValue : fallback;
}
