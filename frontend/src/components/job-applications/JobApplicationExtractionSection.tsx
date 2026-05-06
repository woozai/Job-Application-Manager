import type {
  JobApplicationFormErrors,
  JobApplicationFormValues,
} from "./jobApplicationFormShared";

interface JobApplicationExtractionSectionProps {
  errors: JobApplicationFormErrors;
  extractError: string | null;
  extractWarnings: string[];
  isExtracting: boolean;
  onExtract: () => void;
  updateField: <K extends keyof JobApplicationFormValues>(
    field: K,
    value: JobApplicationFormValues[K],
  ) => void;
  values: JobApplicationFormValues;
}

export function JobApplicationExtractionSection({
  errors,
  extractError,
  extractWarnings,
  isExtracting,
  onExtract,
  updateField,
  values,
}: JobApplicationExtractionSectionProps) {
  return (
    <section className="job-form__section">
      <div className="job-form__section-header">
        <h3>Auto-fill from a job link</h3>
        <p>Paste a job URL and we will try to prefill empty fields while keeping your manual edits intact.</p>
      </div>

      <div className="job-form__grid">
        <div className="form-field job-form__field--full">
          <label className="form-label" htmlFor="extraction_link">
            Job posting link
          </label>
          <input
            id="extraction_link"
            aria-invalid={errors.extraction_link ? "true" : undefined}
            className="form-input"
            onChange={(event) => updateField("extraction_link", event.target.value)}
            placeholder="https://company.com/jobs/backend-engineer"
            type="url"
            value={values.extraction_link}
          />
          {errors.extraction_link ? <p className="form-error">{errors.extraction_link}</p> : null}
        </div>

        <div className="form-field job-form__field--full">
          <label className="form-label" htmlFor="extraction_raw_text">
            Optional pasted description
          </label>
          <textarea
            id="extraction_raw_text"
            className="form-input form-textarea"
            onChange={(event) => updateField("extraction_raw_text", event.target.value)}
            placeholder="Helpful for LinkedIn or blocked pages. Paste the job description here if needed."
            value={values.extraction_raw_text}
          />
          <p className="form-hint">
            You can leave this empty. If the link is blocked or thin, pasted text usually works better.
          </p>
        </div>
      </div>

      <div className="job-form__actions">
        <button
          className="button-link button-link--primary"
          disabled={isExtracting}
          onClick={onExtract}
          type="button"
        >
          {isExtracting ? "Extracting..." : "Extract details"}
        </button>
        {isExtracting ? (
          <p className="form-status" aria-live="polite">
            Reading the link and preparing suggested values...
          </p>
        ) : null}
      </div>

      {extractError ? (
        <section className="feedback-panel feedback-panel--error" role="alert">
          <p className="feedback-panel__eyebrow">Extraction issue</p>
          <h3>We could not fully read that job link</h3>
          <p>{extractError}</p>
          <p>Manual entry is still available, and pasted job text usually works well for LinkedIn or blocked pages.</p>
        </section>
      ) : null}
      {extractWarnings.length > 0 ? (
        <div className="job-form__warnings" role="status">
          <p className="job-form__warnings-title">Extraction notes</p>
          {extractWarnings.map((warning) => (
            <p className="form-hint" key={warning}>
              {warning}
            </p>
          ))}
          <p className="form-hint">
            You can retry anytime. Existing edits stay in place, and only empty fields are filled.
          </p>
        </div>
      ) : null}
    </section>
  );
}
