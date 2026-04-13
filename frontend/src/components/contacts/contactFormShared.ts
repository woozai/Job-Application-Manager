import type { ContactCreateInput, ContactResponse, ContactUpdateInput } from "../../types/contact";

export interface ContactFormValues {
  name: string;
  profile_link: string;
  company: string;
  job_title: string;
  relationship_type: string;
  priority: string;
  connection_requested_at: string;
  connection_approved: string;
  connection_approved_at: string;
  message_sent: string;
  message_sent_at: string;
  response_status: string;
  notes: string;
}

export interface ContactFormErrors {
  name?: string;
}

export const relationshipOptions = ["recruiter", "employee", "manager", "friend", "referral source", "other"];
export const priorityOptions = ["low", "medium", "high"];

function normalizeDateValue(value: string | null | undefined) {
  return value ?? "";
}

export function createInitialValues(
  contact?: ContactResponse | null,
  defaultCompanyName = "",
): ContactFormValues {
  return {
    name: contact?.name ?? "",
    profile_link: contact?.profile_link ?? "",
    company: contact?.company ?? defaultCompanyName,
    job_title: contact?.job_title ?? "",
    relationship_type: contact?.relationship_type ?? "",
    priority: contact?.priority ?? "medium",
    connection_requested_at: normalizeDateValue(contact?.connection_requested_at),
    connection_approved: contact?.connection_approved ? "true" : "false",
    connection_approved_at: normalizeDateValue(contact?.connection_approved_at),
    message_sent: contact?.message_sent ? "true" : "false",
    message_sent_at: normalizeDateValue(contact?.message_sent_at),
    response_status: contact?.response_status ?? "",
    notes: contact?.notes ?? "",
  };
}

function normalizeOptionalValue(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

export function validateForm(values: ContactFormValues) {
  const errors: ContactFormErrors = {};

  if (values.name.trim().length === 0) {
    errors.name = "Contact name is required.";
  }

  return errors;
}

export function buildPayload(values: ContactFormValues, jobApplicationId: number): ContactCreateInput | ContactUpdateInput {
  return {
    job_application_id: jobApplicationId,
    name: values.name.trim(),
    profile_link: normalizeOptionalValue(values.profile_link),
    company: normalizeOptionalValue(values.company),
    job_title: normalizeOptionalValue(values.job_title),
    relationship_type: normalizeOptionalValue(values.relationship_type),
    priority: normalizeOptionalValue(values.priority),
    connection_requested_at: normalizeOptionalValue(values.connection_requested_at),
    connection_approved: values.connection_approved === "true",
    connection_approved_at: normalizeOptionalValue(values.connection_approved_at),
    message_sent: values.message_sent === "true",
    message_sent_at: normalizeOptionalValue(values.message_sent_at),
    response_status: normalizeOptionalValue(values.response_status),
    notes: normalizeOptionalValue(values.notes),
  };
}
