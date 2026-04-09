import { priorityOptions, relationshipOptions, type ContactFormErrors, type ContactFormValues } from "./contactFormShared";

interface ContactCoreSectionProps {
  errors: ContactFormErrors;
  updateField: <K extends keyof ContactFormValues>(field: K, value: ContactFormValues[K]) => void;
  values: ContactFormValues;
}

export function ContactCoreSection({ errors, updateField, values }: ContactCoreSectionProps) {
  return (
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
          <input id="contact_name" className="form-input" value={values.name} onChange={(event) => updateField("name", event.target.value)} aria-invalid={Boolean(errors.name)} />
          {errors.name ? <p className="form-error">{errors.name}</p> : null}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="contact_relationship_type">Relationship</label>
          <select id="contact_relationship_type" className="form-input" value={values.relationship_type} onChange={(event) => updateField("relationship_type", event.target.value)}>
            <option value="">Not set</option>
            {relationshipOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="contact_job_title">Job title</label>
          <input id="contact_job_title" className="form-input" value={values.job_title} onChange={(event) => updateField("job_title", event.target.value)} />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="contact_company">Company</label>
          <input id="contact_company" className="form-input" value={values.company} onChange={(event) => updateField("company", event.target.value)} />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="contact_profile_link">Profile link</label>
          <input id="contact_profile_link" className="form-input" type="url" value={values.profile_link} onChange={(event) => updateField("profile_link", event.target.value)} placeholder="https://linkedin.com/in/..." />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="contact_priority">Priority</label>
          <select id="contact_priority" className="form-input" value={values.priority} onChange={(event) => updateField("priority", event.target.value)}>
            <option value="">Not set</option>
            {priorityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
      </div>
    </section>
  );
}
