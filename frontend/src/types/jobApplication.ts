import type { ContactResponse } from "./contact";

export const jobApplicationStatuses = [
  "saved",
  "applied",
  "waiting",
  "connection requested",
  "connection accepted",
  "referral requested",
  "interview scheduled",
  "interview completed",
  "no longer open",
  "rejected",
  "offer",
  "archived",
] as const;

export type JobApplicationStatus = (typeof jobApplicationStatuses)[number];
export const jobApplicationWorkflowStatuses = jobApplicationStatuses.filter(
  (status) => status !== "archived",
);

export interface JobApplicationResponse {
  id: number;
  user_id: number;
  company_name: string;
  job_title: string;
  job_link: string | null;
  source: string | null;
  application_date: string | null;
  status: JobApplicationStatus | null;
  short_description: string | null;
  full_description: string | null;
  required_skills: string | null;
  notes: string | null;
  location: string | null;
  work_mode: string | null;
  application_type: string | null;
  priority: string | null;
  salary_range: string | null;
  resume_version: string | null;
  recruiter_name: string | null;
  last_follow_up_date: string | null;
  next_action_date: string | null;
  interview_stage: string | null;
  rejection_reason: string | null;
  is_archived: boolean;
  archived_at: string | null;
  archive_reason: string | null;
  contacts: ContactResponse[];
  created_at: string;
  updated_at: string;
}

export interface JobApplicationCreateInput {
  company_name: string;
  job_title: string;
  job_link?: string | null;
  source?: string | null;
  application_date?: string | null;
  status?: JobApplicationStatus | null;
  short_description?: string | null;
  full_description?: string | null;
  required_skills?: string | null;
  notes?: string | null;
  location?: string | null;
  work_mode?: string | null;
  application_type?: string | null;
  priority?: string | null;
  salary_range?: string | null;
  resume_version?: string | null;
  recruiter_name?: string | null;
  last_follow_up_date?: string | null;
  next_action_date?: string | null;
  interview_stage?: string | null;
  rejection_reason?: string | null;
}

export interface JobApplicationUpdateInput {
  company_name?: string;
  job_title?: string;
  job_link?: string | null;
  source?: string | null;
  application_date?: string | null;
  status?: JobApplicationStatus | null;
  short_description?: string | null;
  full_description?: string | null;
  required_skills?: string | null;
  notes?: string | null;
  location?: string | null;
  work_mode?: string | null;
  application_type?: string | null;
  priority?: string | null;
  salary_range?: string | null;
  resume_version?: string | null;
  recruiter_name?: string | null;
  last_follow_up_date?: string | null;
  next_action_date?: string | null;
  interview_stage?: string | null;
  rejection_reason?: string | null;
  is_archived?: boolean;
  archived_at?: string | null;
  archive_reason?: string | null;
}

export interface JobExtractionInput {
  url: string;
  raw_text?: string | null;
}

export interface JobExtractionData {
  company_name: string | null;
  job_title: string | null;
  location: string | null;
  full_description: string | null;
  required_skills: string | null;
  short_description: string | null;
  source: string | null;
  job_link: string | null;
  work_mode: string | null;
  salary_range: string | null;
}

export interface JobExtractionResponse {
  data: JobExtractionData;
  warnings: string[];
}
