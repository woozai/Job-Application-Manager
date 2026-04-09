import { FormEvent, useEffect, useMemo, useState } from "react";

import type { ContactCreateInput, ContactResponse, ContactUpdateInput } from "../../types/contact";

const relationshipOptions = ["recruiter", "employee", "manager", "friend", "referral source", "other"];
const priorityOptions = ["low", "medium", "high"];
const responseStatusOptions = ["awaiting response", "replied", "no response", "declined", "referral offered"];

interface ContactFormValues {
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
  last_interaction_date: string;
  notes: string;
}

interface ContactFormErrors {
  name?: string;
}

interface ContactFormProps {
  contact?: ContactResponse | null;
  isSubmitting: boolean;
  jobApplicationId: number;
  submitError: string | null;
  successMessage: string | null;
  onSubmit: (payload: ContactCreateInput | ContactUpdateInput) => Promise<boolean>;
  onCancel: () => void;
}

function normalizeDateValue(value: string | null | undefined) {
  return value ?? "";
}

function createInitialValues(contact?: ContactResponse | null): ContactFormValues {
  return {
    name: contact?.name ?? "",
    profile_link: contact?.profile_link ?? "",
    company: contact?.company ?? "",
    job_title: contact?.job_title ?? "",
    relationship_type: contact?.relationship_type ?? "",
    priority: contact?.priority ?? "medium",
    connection_requested_at: normalizeDateValue(contact?.connection_requested_at),
    connection_approved: contact?.connection_approved ? "true" : "false",
    connection_approved_at: normalizeDateValue(contact?.connection_approved_at),
    message_sent: contact?.message_sent ? "true" : "false",
    message_sent_at: normalizeDateValue(contact?.message_sent_at),
    response_status: contact?.response_status ?? "",
    last_interaction_date: normalizeDateValue(contact?.last_interaction_date),
    notes: contact?.notes ?? "",
  };
}

function normalizeOptionalValue(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function validateForm(values: ContactFormValues) {
  const errors: ContactFormErrors = {};

  if (values.name.trim().length === 0) {
    errors.name = "Contact name is required.";
  }

  return errors;
}

function buildPayload(
  values: ContactFormValues,
  jobApplicationId: number,
): ContactCreateInput | ContactUpdateInput {
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
    last_interaction_date: normalizeOptionalValue(values.last_interaction_date),
    notes: normalizeOptionalValue(values.notes),
  };
}

export function ContactForm({
  contact,
  isSubmitting,
  jobApplicationId,
  submitError,
  successMessage,
  onSubmit,
  onCancel,
}: ContactFormProps) {
  const isEditing = Boolean(contact);
  const initialValues = useMemo(() => createInitialValues(contact), [contact]);
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [errors, setErrors] = useState<ContactFormErrors>({});

  useEffect(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  function updateField<K extends keyof ContactFormValues>(field: K, value: ContactFormValues[K]) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setErrors((currentErrors) => {
      if (!currentErrors[field as keyof ContactFormErrors]) {
        return currentErrors;
      }

      return {
        ...currentErrors,
        [field]: undefined,
      };
    });
  }

  function resetForm() {
    setValues(initialValues);
    setErrors({});
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const wasSaved = await onSubmit(buildPayload(values, jobApplicationId));

    if (wasSaved && !isEditing) {
      resetForm();
    }
  }

  return (
    <section className="page-card">
      <p className="page-card__eyebrow">Contacts</p>
      <div className="details-section__header">
        <div>
          <h2>{isEditing ? "Edit contact" : "Add a contact"}</h2>
          <p className="page-card__body">
            {isEditing
              ? "Update this contact's details, outreach history, and notes without losing the job context."
              : "Save the people connected to this opportunity so your outreach history stays attached to the job."}
          </p>
        </div>
        <button className="button-link" disabled={isSubmitting} onClick={onCancel} type="button">
          Close
        </button>
      </div>

      <form className="contact-form" noValidate onSubmit={handleSubmit}>
        <section className="contact-form__section">
          <div className="contact-form__header">
            <h3>Core details</h3>
            <p>Capture who this person is and how they relate to the application.</p>
          </div>

          <div className="job-form__grid">
            <div className="form-field">
              <label className="form-label" htmlFor="contact_name">
                Contact name <span className="form-label__required">*</span>
              </label>
              <input
                id="contact_name"
                className="form-input"
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name ? <p className="form-error">{errors.name}</p> : null}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="contact_relationship_type">
                Relationship
              </label>
              <select
                id="contact_relationship_type"
                className="form-input"
                value={values.relationship_type}
                onChange={(event) => updateField("relationship_type", event.target.value)}
              >
                <option value="">Not set</option>
                {relationshipOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="contact_job_title">
                Job title
              </label>
              <input
                id="contact_job_title"
                className="form-input"
                value={values.job_title}
                onChange={(event) => updateField("job_title", event.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="contact_company">
                Company
              </label>
              <input
                id="contact_company"
                className="form-input"
                value={values.company}
                onChange={(event) => updateField("company", event.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="contact_profile_link">
                Profile link
              </label>
              <input
                id="contact_profile_link"
                className="form-input"
                type="url"
                value={values.profile_link}
                onChange={(event) => updateField("profile_link", event.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="contact_priority">
                Priority
              </label>
              <select
                id="contact_priority"
                className="form-input"
                value={values.priority}
                onChange={(event) => updateField("priority", event.target.value)}
              >
                <option value="">Not set</option>
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="contact-form__section">
          <div className="contact-form__header">
            <h3>Outreach tracking</h3>
            <p>Record whether a connection or message has already gone out and how it is progressing.</p>
          </div>

          <div className="job-form__grid">
            <div className="form-field">
              <label className="form-label" htmlFor="contact_connection_requested_at">
                Connection requested
              </label>
              <input
                id="contact_connection_requested_at"
                className="form-input"
                type="date"
                value={values.connection_requested_at}
                onChange={(event) => updateField("connection_requested_at", event.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="contact_connection_approved">
                Connection approved
              </label>
              <select
                id="contact_connection_approved"
                className="form-input"
                value={values.connection_approved}
                onChange={(event) => updateField("connection_approved", event.target.value)}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="contact_connection_approved_at">
                Approval date
              </label>
              <input
                id="contact_connection_approved_at"
                className="form-input"
                type="date"
                value={values.connection_approved_at}
                onChange={(event) => updateField("connection_approved_at", event.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="contact_message_sent">
                Message sent
              </label>
              <select
                id="contact_message_sent"
                className="form-input"
                value={values.message_sent}
                onChange={(event) => updateField("message_sent", event.target.value)}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="contact_message_sent_at">
                Message date
              </label>
              <input
                id="contact_message_sent_at"
                className="form-input"
                type="date"
                value={values.message_sent_at}
                onChange={(event) => updateField("message_sent_at", event.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="contact_response_status">
                Response status
              </label>
              <select
                id="contact_response_status"
                className="form-input"
                value={values.response_status}
                onChange={(event) => updateField("response_status", event.target.value)}
              >
                <option value="">Not set</option>
                {responseStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="contact_last_interaction_date">
                Last interaction
              </label>
              <input
                id="contact_last_interaction_date"
                className="form-input"
                type="date"
                value={values.last_interaction_date}
                onChange={(event) => updateField("last_interaction_date", event.target.value)}
              />
            </div>

            <div className="form-field job-form__field--full">
              <label className="form-label" htmlFor="contact_notes">
                Notes
              </label>
              <textarea
                id="contact_notes"
                className="form-input form-textarea"
                value={values.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Referral context, follow-up reminders, or conversation notes"
              />
            </div>
          </div>
        </section>

        {submitError ? (
          <section className="feedback-panel feedback-panel--error" role="alert">
            <p className="feedback-panel__eyebrow">Form error</p>
            <h3>We could not save this contact</h3>
            <p>{submitError}</p>
          </section>
        ) : null}

        {successMessage ? (
          <section className="feedback-panel feedback-panel--success" role="status">
            <p className="feedback-panel__eyebrow">Success</p>
            <h3>{isEditing ? "Contact updated" : "Contact added"}</h3>
            <p>{successMessage}</p>
          </section>
        ) : null}

        <div className="job-form__actions">
          <button className="button-link button-link--primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving contact..." : isEditing ? "Save changes" : "Add contact"}
          </button>
          <button className="button-link" disabled={isSubmitting} onClick={resetForm} type="button">
            Reset form
          </button>
          <button className="button-link" disabled={isSubmitting} onClick={onCancel} type="button">
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
