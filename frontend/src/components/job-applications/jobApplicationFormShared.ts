import { jobApplicationWorkflowStatuses } from "../../types/jobApplication";
import type {
  JobApplicationCreateInput,
  JobExtractionData,
  JobApplicationResponse,
} from "../../types/jobApplication";

export interface JobApplicationFormValues {
  extraction_mode: "link" | "text";
  extraction_link: string;
  extraction_raw_text: string;
  company_name: string;
  job_title: string;
  job_link: string;
  source: string;
  application_date: string;
  status: string;
  short_description: string;
  full_description: string;
  required_skills: string;
  notes: string;
  location: string;
  work_mode: string;
  application_type: string;
  priority: string;
  salary_range: string;
  resume_version: string;
  recruiter_name: string;
  last_follow_up_date: string;
  next_action_date: string;
  interview_stage: string;
  rejection_reason: string;
}

export interface JobApplicationFormErrors {
  extraction_link?: string;
  extraction_raw_text?: string;
  company_name?: string;
  job_title?: string;
}

export const statusOptions = jobApplicationWorkflowStatuses;

export const workModeOptions = ["remote", "hybrid", "onsite"];
export const applicationTypeOptions = ["direct", "through connection", "recruiter"];
export const priorityOptions = ["low", "medium", "high"];

export function createInitialValues(initialData?: JobApplicationResponse): JobApplicationFormValues {
  return {
    extraction_mode: "link",
    extraction_link: initialData?.job_link ?? "",
    extraction_raw_text: "",
    company_name: initialData?.company_name ?? "",
    job_title: initialData?.job_title ?? "",
    job_link: initialData?.job_link ?? "",
    source: initialData?.source ?? "",
    application_date: initialData?.application_date ?? "",
    status: initialData?.status ?? "saved",
    short_description: initialData?.short_description ?? "",
    full_description: initialData?.full_description ?? "",
    required_skills: initialData?.required_skills ?? "",
    notes: initialData?.notes ?? "",
    location: initialData?.location ?? "",
    work_mode: initialData?.work_mode ?? "",
    application_type: initialData?.application_type ?? "",
    priority: initialData?.priority ?? "",
    salary_range: initialData?.salary_range ?? "",
    resume_version: initialData?.resume_version ?? "",
    recruiter_name: initialData?.recruiter_name ?? "",
    last_follow_up_date: initialData?.last_follow_up_date ?? "",
    next_action_date: initialData?.next_action_date ?? "",
    interview_stage: initialData?.interview_stage ?? "",
    rejection_reason: initialData?.rejection_reason ?? "",
  };
}

export function validateForm(values: JobApplicationFormValues) {
  const errors: JobApplicationFormErrors = {};

  if (values.company_name.trim().length === 0) {
    errors.company_name = "Company name is required.";
  }

  if (values.job_title.trim().length === 0) {
    errors.job_title = "Job title is required.";
  }

  return errors;
}

export function normalizeOptionalValue(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

export function buildPayload(values: JobApplicationFormValues): JobApplicationCreateInput {
  return {
    company_name: values.company_name.trim(),
    job_title: values.job_title.trim(),
    job_link: normalizeOptionalValue(values.job_link),
    source: normalizeOptionalValue(values.source),
    application_date: normalizeOptionalValue(values.application_date),
    status: normalizeOptionalValue(values.status) as JobApplicationCreateInput["status"],
    short_description: normalizeOptionalValue(values.short_description),
    full_description: normalizeOptionalValue(values.full_description),
    required_skills: normalizeOptionalValue(values.required_skills),
    notes: normalizeOptionalValue(values.notes),
    location: normalizeOptionalValue(values.location),
    work_mode: normalizeOptionalValue(values.work_mode),
    application_type: normalizeOptionalValue(values.application_type),
    priority: normalizeOptionalValue(values.priority),
    salary_range: normalizeOptionalValue(values.salary_range),
    resume_version: normalizeOptionalValue(values.resume_version),
    recruiter_name: normalizeOptionalValue(values.recruiter_name),
    last_follow_up_date: normalizeOptionalValue(values.last_follow_up_date),
    next_action_date: normalizeOptionalValue(values.next_action_date),
    interview_stage: normalizeOptionalValue(values.interview_stage),
    rejection_reason: normalizeOptionalValue(values.rejection_reason),
  };
}

const extractionFieldMap = [
  "company_name",
  "job_title",
  "location",
  "full_description",
  "required_skills",
  "short_description",
  "source",
  "job_link",
  "work_mode",
  "salary_range",
] as const;

type ExtractionFieldName = (typeof extractionFieldMap)[number];

export function mergeExtractedValues(
  currentValues: JobApplicationFormValues,
  extracted: JobExtractionData,
) {
  const nextValues: JobApplicationFormValues = { ...currentValues };

  extractionFieldMap.forEach((fieldName: ExtractionFieldName) => {
    const currentValue = currentValues[fieldName];
    const extractedValue = extracted[fieldName];

    if (currentValue.trim().length > 0) {
      return;
    }

    nextValues[fieldName] = extractedValue ?? "";
  });

  if (nextValues.job_link.trim().length === 0 && currentValues.extraction_link.trim().length > 0) {
    nextValues.job_link = currentValues.extraction_link.trim();
  }

  return nextValues;
}
