import { FormEvent, useEffect, useMemo, useState } from "react";

import { ContactCoreSection } from "./ContactCoreSection";
import { ContactOutreachSection } from "./ContactOutreachSection";
import { buildPayload, createInitialValues, type ContactFormErrors, type ContactFormValues, validateForm } from "./contactFormShared";

import { getContactResponseStatuses } from "../../api/contacts";
import type { ContactCreateInput, ContactResponse, ContactUpdateInput } from "../../types/contact";

interface ContactFormProps {
  contact?: ContactResponse | null;
  defaultCompanyName?: string;
  isSubmitting: boolean;
  jobApplicationId: number;
  submitError: string | null;
  successMessage: string | null;
  onSubmit: (payload: ContactCreateInput | ContactUpdateInput) => Promise<boolean>;
  onCancel: () => void;
}

export function ContactForm({
  contact,
  defaultCompanyName = "",
  isSubmitting,
  jobApplicationId,
  submitError,
  successMessage,
  onSubmit,
  onCancel,
}: ContactFormProps) {
  const isEditing = Boolean(contact);
  const initialValues = useMemo(
    () => createInitialValues(contact, defaultCompanyName),
    [contact, defaultCompanyName],
  );
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [responseStatusOptions, setResponseStatusOptions] = useState<string[]>([]);
  const [responseStatusOptionsError, setResponseStatusOptionsError] = useState<string | null>(null);
  const [isLoadingResponseStatuses, setIsLoadingResponseStatuses] = useState(true);

  const visibleResponseStatusOptions = useMemo(() => {
    if (
      values.response_status &&
      !responseStatusOptions.includes(values.response_status)
    ) {
      return [values.response_status, ...responseStatusOptions];
    }

    return responseStatusOptions;
  }, [responseStatusOptions, values.response_status]);

  useEffect(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  useEffect(() => {
    let shouldUpdate = true;

    async function loadResponseStatuses() {
      setIsLoadingResponseStatuses(true);
      setResponseStatusOptionsError(null);

      try {
        const loadedStatuses = await getContactResponseStatuses();

        if (shouldUpdate) {
          setResponseStatusOptions(loadedStatuses);
        }
      } catch {
        if (shouldUpdate) {
          setResponseStatusOptionsError("Could not load response statuses from the server.");
        }
      } finally {
        if (shouldUpdate) {
          setIsLoadingResponseStatuses(false);
        }
      }
    }

    void loadResponseStatuses();

    return () => {
      shouldUpdate = false;
    };
  }, []);

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

    if (isSubmitting) {
      return;
    }

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
        <ContactCoreSection errors={errors} updateField={updateField} values={values} />
        <ContactOutreachSection
          isLoadingResponseStatuses={isLoadingResponseStatuses}
          responseStatusOptions={visibleResponseStatusOptions}
          responseStatusOptionsError={responseStatusOptionsError}
          updateField={updateField}
          values={values}
        />

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

        {isSubmitting ? (
          <p className="form-status" aria-live="polite">
            {isEditing ? "Saving contact changes..." : "Adding contact..."}
          </p>
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
