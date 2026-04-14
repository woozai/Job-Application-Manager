import type { StatusTone } from "./statusTone";

const contactResponseStatusToneMap: Record<string, StatusTone> = {
  "awaiting response": "warning",
  replied: "positive",
  "resume forwarded": "positive",
  "no response": "warning",
  declined: "negative",
  "referral offered": "positive",
};

export function getContactResponseStatusTone(
  status: string | null | undefined,
): StatusTone {
  const normalizedStatus = status?.trim().toLowerCase();

  return normalizedStatus && normalizedStatus in contactResponseStatusToneMap
    ? contactResponseStatusToneMap[normalizedStatus]
    : "neutral";
}
