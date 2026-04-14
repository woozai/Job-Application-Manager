import type { JobApplicationStatus } from "../types/jobApplication";
import type { StatusTone } from "./statusTone";

const jobApplicationStatusToneMap: Record<JobApplicationStatus, StatusTone> = {
  saved: "neutral",
  applied: "info",
  waiting: "warning",
  "connection requested": "info",
  "connection accepted": "positive",
  "referral requested": "warning",
  "interview scheduled": "positive",
  "interview completed": "positive",
  "no longer open": "negative",
  rejected: "negative",
  offer: "positive",
  archived: "neutral",
};

export function getJobApplicationStatusTone(
  status: string | null | undefined,
): StatusTone {
  const normalizedStatus = status?.trim().toLowerCase() as JobApplicationStatus | undefined;

  return normalizedStatus && normalizedStatus in jobApplicationStatusToneMap
    ? jobApplicationStatusToneMap[normalizedStatus]
    : "neutral";
}
