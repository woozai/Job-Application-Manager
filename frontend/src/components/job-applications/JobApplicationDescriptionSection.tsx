import type { JobApplicationFormValues } from "./jobApplicationFormShared";

interface JobApplicationDescriptionSectionProps {
  updateField: <K extends keyof JobApplicationFormValues>(field: K, value: JobApplicationFormValues[K]) => void;
  values: JobApplicationFormValues;
}

export function JobApplicationDescriptionSection({
  updateField,
  values,
}: JobApplicationDescriptionSectionProps) {
  return (
    <section className="job-form__section">
      <div className="job-form__section-header">
        <h3>Description and notes</h3>
        <p>Keep the important context close to the application record. Markdown is supported in the description and notes fields.</p>
      </div>

      <div className="job-form__grid">
        <div className="form-field job-form__field--full">
          <label className="form-label" htmlFor="short_description">Short description</label>
          <textarea id="short_description" className="form-input form-textarea" value={values.short_description} onChange={(event) => updateField("short_description", event.target.value)} />
          <p className="form-hint">Supports Markdown like lists, links, bold text, and inline code.</p>
        </div>

        <div className="form-field job-form__field--full">
          <label className="form-label" htmlFor="full_description">Full description</label>
          <textarea id="full_description" className="form-input form-textarea" value={values.full_description} onChange={(event) => updateField("full_description", event.target.value)} />
          <p className="form-hint">Supports Markdown like lists, links, bold text, and inline code.</p>
        </div>

        <div className="form-field job-form__field--full">
          <label className="form-label" htmlFor="required_skills">Required skills</label>
          <textarea id="required_skills" className="form-input form-textarea" value={values.required_skills} onChange={(event) => updateField("required_skills", event.target.value)} />
          <p className="form-hint">Supports Markdown like lists, links, bold text, and inline code.</p>
        </div>

        <div className="form-field job-form__field--full">
          <label className="form-label" htmlFor="notes">Notes</label>
          <textarea id="notes" className="form-input form-textarea" value={values.notes} onChange={(event) => updateField("notes", event.target.value)} />
          <p className="form-hint">Supports Markdown like lists, links, bold text, and inline code.</p>
        </div>
      </div>
    </section>
  );
}
