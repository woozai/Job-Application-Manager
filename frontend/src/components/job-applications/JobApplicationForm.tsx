import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import type {
  JobApplicationCreateInput,
  JobApplicationResponse,
  JobApplicationUpdateInput,
} from "../../types/jobApplication";

const statusOptions = [
  "saved",
  "applied",
  "waiting",
  "connection requested",
  "connection accepted",
  "referral requested",
  "interview scheduled",
  "interview completed",
  "rejected",
  "offer",
  "archived",
];

const workModeOptions = ["remote", "hybrid", "onsite"];
const applicationTypeOptions = ["direct", "through connection", "recruiter"];
const priorityOptions = ["low", "medium", "high"];

interface JobApplicationFormValues {
  company_name: string;
  job_title: string;
  job_link: string;
  source_link: string;
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
  tags: string;
}

interface JobApplicationFormErrors {
  company_name?: string;
  job_title?: string;
}

interface JobApplicationFormProps {
  initialData?: JobApplicationResponse;
  isSubmitting: boolean;
  submitError: string | null;
  submitLabel: string;
  title: string;
  description: string;
  onSubmit: (payload: JobApplicationCreateInput | JobApplicationUpdateInput) => Promise<void>;
}

function createInitialValues(initialData?: JobApplicationResponse): JobApplicationFormValues {
  return {
    company_name: initialData?.company_name ?? "",
    job_title: initialData?.job_title ?? "",
    job_link: initialData?.job_link ?? "",
    source_link: initialData?.source_link ?? "",
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
    tags: initialData?.tags ?? "",
  };
}

function validateForm(values: JobApplicationFormValues) {
  const errors: JobApplicationFormErrors = {};

  if (values.company_name.trim().length === 0) {
    errors.company_name = "Company name is required.";
  }

  if (values.job_title.trim().length === 0) {
    errors.job_title = "Job title is required.";
  }

  return errors;
}

function normalizeOptionalValue(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function buildPayload(values: JobApplicationFormValues): JobApplicationCreateInput | JobApplicationUpdateInput {
  return {
    company_name: values.company_name.trim(),
    job_title: values.job_title.trim(),
    job_link: normalizeOptionalValue(values.job_link),
    source_link: normalizeOptionalValue(values.source_link),
    source: normalizeOptionalValue(values.source),
    application_date: normalizeOptionalValue(values.application_date),
    status: normalizeOptionalValue(values.status),
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
    tags: normalizeOptionalValue(values.tags),
  };
}

export function JobApplicationForm({
  initialData,
  isSubmitting,
  submitError,
  submitLabel,
  title,
  description,
  onSubmit,
}: JobApplicationFormProps) {
  const [values, setValues] = useState<JobApplicationFormValues>(() => createInitialValues(initialData));
  const [errors, setErrors] = useState<JobApplicationFormErrors>({});

  const initialValues = useMemo(() => createInitialValues(initialData), [initialData]);

  function updateField<K extends keyof JobApplicationFormValues>(
    field: K,
    value: JobApplicationFormValues[K],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setErrors((currentErrors) => {
      if (!currentErrors[field as keyof JobApplicationFormErrors]) {
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

    await onSubmit(buildPayload(values));
  }

  return (
    <section className="page-card">
      <p className="page-card__eyebrow">Job application</p>
      <h2>{title}</h2>
      <p className="page-card__body">{description}</p>

      <form className="job-form" noValidate onSubmit={handleSubmit}>
        <section className="job-form__section">
          <div className="job-form__section-header">
            <h3>Core details</h3>
            <p>Capture the opportunity basics so it is easy to find later.</p>
          </div>

          <div className="job-form__grid">
            <div className="form-field">
              <label className="form-label" htmlFor="company_name">
                Company name <span className="form-label__required">*</span>
              </label>
              <input
                id="company_name"
                className="form-input"
                value={values.company_name}
                onChange={(event) => updateField("company_name", event.target.value)}
                aria-invalid={Boolean(errors.company_name)}
              />
              {errors.company_name ? <p className="form-error">{errors.company_name}</p> : null}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="job_title">
                Job title <span className="form-label__required">*</span>
              </label>
              <input
                id="job_title"
                className="form-input"
                value={values.job_title}
                onChange={(event) => updateField("job_title", event.target.value)}
                aria-invalid={Boolean(errors.job_title)}
              />
              {errors.job_title ? <p className="form-error">{errors.job_title}</p> : null}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                className="form-input"
                value={values.status}
                onChange={(event) => updateField("status", event.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="application_date">
                Application date
              </label>
              <input
                id="application_date"
                className="form-input"
                type="date"
                value={values.application_date}
                onChange={(event) => updateField("application_date", event.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="job_link">
                Job link
              </label>
              <input
                id="job_link"
                className="form-input"
                type="url"
                value={values.job_link}
                onChange={(event) => updateField("job_link", event.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="source_link">
                Source link
              </label>
              <input
                id="source_link"
                className="form-input"
                type="url"
                value={values.source_link}
                onChange={(event) => updateField("source_link", event.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="source">
                Source
              </label>
              <input
                id="source"
                className="form-input"
                value={values.source}
                onChange={(event) => updateField("source", event.target.value)}
                placeholder="LinkedIn, company site, recruiter"
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="location">
                Location
              </label>
              <input
                id="location"
                className="form-input"
                value={values.location}
                onChange={(event) => updateField("location", event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="job-form__section">
          <div className="job-form__section-header">
            <h3>Description and notes</h3>
            <p>Keep the important context close to the application record.</p>
          </div>

          <div className="job-form__grid">
            <div className="form-field job-form__field--full">
              <label className="form-label" htmlFor="short_description">
                Short description
              </label>
              <textarea
                id="short_description"
                className="form-input form-textarea"
                value={values.short_description}
                onChange={(event) => updateField("short_description", event.target.value)}
              />
            </div>

            <div className="form-field job-form__field--full">
              <label className="form-label" htmlFor="full_description">
                Full description
              </label>
              <textarea
                id="full_description"
                className="form-input form-textarea"
                value={values.full_description}
                onChange={(event) => updateField("full_description", event.target.value)}
              />
            </div>

            <div className="form-field job-form__field--full">
              <label className="form-label" htmlFor="required_skills">
                Required skills
              </label>
              <textarea
                id="required_skills"
                className="form-input form-textarea"
                value={values.required_skills}
                onChange={(event) => updateField("required_skills", event.target.value)}
              />
            </div>

            <div className="form-field job-form__field--full">
              <label className="form-label" htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                className="form-input form-textarea"
                value={values.notes}
                onChange={(event) => updateField("notes", event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="job-form__section">
          <div className="job-form__section-header">
            <h3>Process tracking</h3>
            <p>Track how the application is moving and what needs follow-up.</p>
          </div>

          <div className="job-form__grid">
            <div className="form-field">
              <label className="form-label" htmlFor="work_mode">
                Work mode
              </label>
              <select
                id="work_mode"
                className="form-input"
                value={values.work_mode}
                onChange={(event) => updateField("work_mode", event.target.value)}
              >
                <option value="">Not set</option>
                {workModeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="application_type">
                Application type
              </label>
              <select
                id="application_type"
                className="form-input"
                value={values.application_type}
                onChange={(event) => updateField("application_type", event.target.value)}
              >
                <option value="">Not set</option>
                {applicationTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
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

            <div className="form-field">
              <label className="form-label" htmlFor="salary_range">
                Salary range
              </label>
              <input
                id="salary_range"
                className="form-input"
                value={values.salary_range}
                onChange={(event) => updateField("salary_range", event.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="resume_version">
                Resume version
              </label>
              <input
                id="resume_version"
                className="form-input"
                value={values.resume_version}
                onChange={(event) => updateField("resume_version", event.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="recruiter_name">
                Recruiter name
              </label>
              <input
                id="recruiter_name"
                className="form-input"
                value={values.recruiter_name}
                onChange={(event) => updateField("recruiter_name", event.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="last_follow_up_date">
                Last follow-up date
              </label>
              <input
                id="last_follow_up_date"
                className="form-input"
                type="date"
                value={values.last_follow_up_date}
                onChange={(event) => updateField("last_follow_up_date", event.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="next_action_date">
                Next action date
              </label>
              <input
                id="next_action_date"
                className="form-input"
                type="date"
                value={values.next_action_date}
                onChange={(event) => updateField("next_action_date", event.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="interview_stage">
                Interview stage
              </label>
              <input
                id="interview_stage"
                className="form-input"
                value={values.interview_stage}
                onChange={(event) => updateField("interview_stage", event.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="rejection_reason">
                Rejection reason
              </label>
              <input
                id="rejection_reason"
                className="form-input"
                value={values.rejection_reason}
                onChange={(event) => updateField("rejection_reason", event.target.value)}
              />
            </div>

            <div className="form-field job-form__field--full">
              <label className="form-label" htmlFor="tags">
                Tags
              </label>
              <input
                id="tags"
                className="form-input"
                value={values.tags}
                onChange={(event) => updateField("tags", event.target.value)}
                placeholder="frontend, remote, referral"
              />
              <p className="form-hint">Separate tags with commas.</p>
            </div>
          </div>
        </section>

        {submitError ? (
          <section className="feedback-panel feedback-panel--error" role="alert">
            <p className="feedback-panel__eyebrow">Form error</p>
            <h3>We could not save this application</h3>
            <p>{submitError}</p>
          </section>
        ) : null}

        <div className="job-form__actions">
          <button className="button-link button-link--primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
          <button className="button-link" disabled={isSubmitting} onClick={resetForm} type="button">
            Reset form
          </button>
          <Link className="button-link" to="/dashboard">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
