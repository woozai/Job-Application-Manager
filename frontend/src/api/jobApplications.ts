import { apiRequest, createListQueryParams } from "./client";

import type { ApiMessageResponse, ListQueryParams } from "../types/api";
import type {
  JobApplicationCreateInput,
  JobApplicationResponse,
  JobApplicationUpdateInput,
} from "../types/jobApplication";

export function createJobApplication(jobApplication: JobApplicationCreateInput, token: string) {
  return apiRequest<JobApplicationResponse>("/job-applications/", {
    method: "POST",
    body: jobApplication,
    token,
  });
}

export function getJobApplications(token: string, params: ListQueryParams = {}) {
  return apiRequest<JobApplicationResponse[]>(
    "/job-applications/",
    { token },
    createListQueryParams(params.skip, params.limit),
  );
}

export function getJobApplication(jobApplicationId: number, token: string) {
  return apiRequest<JobApplicationResponse>(`/job-applications/${jobApplicationId}`, { token });
}

export function getJobApplicationsByUser(
  userId: number,
  token: string,
  params: ListQueryParams = {},
) {
  return apiRequest<JobApplicationResponse[]>(
    `/job-applications/user/${userId}`,
    { token },
    createListQueryParams(params.skip, params.limit),
  );
}

export function updateJobApplication(
  jobApplicationId: number,
  jobApplication: JobApplicationUpdateInput,
  token: string,
) {
  return apiRequest<JobApplicationResponse>(`/job-applications/${jobApplicationId}`, {
    method: "PUT",
    body: jobApplication,
    token,
  });
}

export function archiveJobApplication(
  jobApplicationId: number,
  token: string,
  archiveReason?: string | null,
) {
  return updateJobApplication(
    jobApplicationId,
    {
      is_archived: true,
      archive_reason: archiveReason ?? null,
    },
    token,
  );
}

export function restoreJobApplication(jobApplicationId: number, token: string) {
  return updateJobApplication(
    jobApplicationId,
    {
      is_archived: false,
    },
    token,
  );
}

export function deleteJobApplication(jobApplicationId: number, token: string) {
  return apiRequest<ApiMessageResponse>(`/job-applications/${jobApplicationId}`, {
    method: "DELETE",
    token,
  });
}
