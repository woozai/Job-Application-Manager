import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { JobApplicationCoreSection } from "./JobApplicationCoreSection";
import { JobApplicationDescriptionSection } from "./JobApplicationDescriptionSection";
import { JobApplicationProcessSection } from "./JobApplicationProcessSection";
import { buildPayload, createInitialValues, type JobApplicationFormErrors, type JobApplicationFormValues, validateForm } from "./jobApplicationFormShared";

import type { JobApplicationCreateInput, JobApplicationResponse } from "../../types/jobApplication";

interface JobApplicationFormProps {
  initialData?: JobApplicationResponse;
  isSubmitting: boolean;
  submitError: string | null;
  submitLabel: string;
  submittingLabel?: string;
  title: string;
  description: string;
  onSubmit: (payload: JobApplicationCreateInput) => Promise<void>;
}

export function JobApplicationForm({
  initialData,
  isSubmitting,
  submitError,
  submitLabel,
  submittingLabel = "Saving your application. Please wait...",
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

     if (isSubmitting) {
      return;
    }

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
        <JobApplicationCoreSection errors={errors} updateField={updateField} values={values} />
        <JobApplicationDescriptionSection updateField={updateField} values={values} />
        <JobApplicationProcessSection updateField={updateField} values={values} />

        {submitError ? (
          <section className="feedback-panel feedback-panel--error" role="alert">
            <p className="feedback-panel__eyebrow">Form error</p>
            <h3>We could not save this application</h3>
            <p>{submitError}</p>
          </section>
        ) : null}

        {isSubmitting ? (
          <p className="form-status" aria-live="polite">
            {submittingLabel}
          </p>
        ) : null}

        <div className="job-form__actions">
          <button className="button-link button-link--primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
          <button className="button-link" disabled={isSubmitting} onClick={resetForm} type="button">
            Reset form
          </button>
          {isSubmitting ? (
            <span className="button-link button-link--disabled" aria-disabled="true">
              Cancel
            </span>
          ) : (
            <Link className="button-link" to="/dashboard">
              Cancel
            </Link>
          )}
        </div>
      </form>
    </section>
  );
}
