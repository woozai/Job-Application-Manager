import type { JobApplicationFormErrors, JobApplicationFormValues } from "./jobApplicationFormShared";
import { statusOptions } from "./jobApplicationFormShared";

interface JobApplicationCoreSectionProps {
  errors: JobApplicationFormErrors;
  updateField: <K extends keyof JobApplicationFormValues>(field: K, value: JobApplicationFormValues[K]) => void;
  values: JobApplicationFormValues;
}

export function JobApplicationCoreSection({ errors, updateField, values }: JobApplicationCoreSectionProps) {
  return (
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
          <label className="form-label" htmlFor="status">Status</label>
          <select id="status" className="form-input" value={values.status} onChange={(event) => updateField("status", event.target.value)}>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="application_date">Application date</label>
          <input id="application_date" className="form-input" type="date" value={values.application_date} onChange={(event) => updateField("application_date", event.target.value)} />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="job_link">Job link</label>
          <input id="job_link" className="form-input" type="url" value={values.job_link} onChange={(event) => updateField("job_link", event.target.value)} />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="source">Source</label>
          <input id="source" className="form-input" value={values.source} onChange={(event) => updateField("source", event.target.value)} placeholder="LinkedIn, company site, recruiter" />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="location">Location</label>
          <input id="location" className="form-input" value={values.location} onChange={(event) => updateField("location", event.target.value)} />
        </div>
      </div>
    </section>
  );
}
