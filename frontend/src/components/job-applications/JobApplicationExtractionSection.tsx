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
        <p>Choose one input method. We will only fill empty fields, so your manual edits stay intact.</p>
      </div>

      <div className="job-form__mode-switch" role="tablist" aria-label="Extraction input method">
        <button
          aria-selected={values.extraction_mode === "link"}
          className={`job-form__mode-button ${values.extraction_mode === "link" ? "job-form__mode-button--active" : ""}`}
          onClick={() => updateField("extraction_mode", "link")}
          role="tab"
          type="button"
        >
          Use a link
        </button>
        <button
          aria-selected={values.extraction_mode === "text"}
          className={`job-form__mode-button ${values.extraction_mode === "text" ? "job-form__mode-button--active" : ""}`}
          onClick={() => updateField("extraction_mode", "text")}
          role="tab"
          type="button"
        >
          Paste text
        </button>
      </div>

      <div className="job-form__grid">
        {values.extraction_mode === "link" ? (
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
            <p className="form-hint">
              Best for public job pages. If LinkedIn or another site looks incomplete, switch to pasted text.
            </p>
          </div>
        ) : (
          <div className="form-field job-form__field--full">
            <label className="form-label" htmlFor="extraction_raw_text">
              Pasted job description
            </label>
            <textarea
              id="extraction_raw_text"
              aria-invalid={errors.extraction_raw_text ? "true" : undefined}
              className="form-input form-textarea"
              onChange={(event) => updateField("extraction_raw_text", event.target.value)}
              placeholder="Paste the job description here, especially for LinkedIn or blocked pages."
              value={values.extraction_raw_text}
            />
            {errors.extraction_raw_text ? <p className="form-error">{errors.extraction_raw_text}</p> : null}
            <p className="form-hint">
              Best when the page is blocked, thin, or difficult to read automatically.
            </p>
          </div>
        )}
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
