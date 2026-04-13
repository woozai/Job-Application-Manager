import { responseStatusOptions, type ContactFormValues } from "./contactFormShared";

interface ContactOutreachSectionProps {
  updateField: <K extends keyof ContactFormValues>(field: K, value: ContactFormValues[K]) => void;
  values: ContactFormValues;
}

export function ContactOutreachSection({ updateField, values }: ContactOutreachSectionProps) {
  return (
    <section className="contact-form__section">
      <div className="contact-form__header">
        <h3>Outreach tracking</h3>
        <p>Record whether a connection or message has already gone out and how it is progressing.</p>
      </div>

      <div className="job-form__grid">
        <div className="form-field">
          <label className="form-label" htmlFor="contact_connection_requested_at">Connection requested</label>
          <input id="contact_connection_requested_at" className="form-input" type="date" value={values.connection_requested_at} onChange={(event) => updateField("connection_requested_at", event.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="contact_connection_approved">Connection approved</label>
          <select id="contact_connection_approved" className="form-input" value={values.connection_approved} onChange={(event) => updateField("connection_approved", event.target.value)}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="contact_connection_approved_at">Approval date</label>
          <input id="contact_connection_approved_at" className="form-input" type="date" value={values.connection_approved_at} onChange={(event) => updateField("connection_approved_at", event.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="contact_message_sent">Message sent</label>
          <select id="contact_message_sent" className="form-input" value={values.message_sent} onChange={(event) => updateField("message_sent", event.target.value)}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="contact_message_sent_at">Message date</label>
          <input id="contact_message_sent_at" className="form-input" type="date" value={values.message_sent_at} onChange={(event) => updateField("message_sent_at", event.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="contact_response_status">Response status</label>
          <select id="contact_response_status" className="form-input" value={values.response_status} onChange={(event) => updateField("response_status", event.target.value)}>
            <option value="">Not set</option>
            {responseStatusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
        <div className="form-field job-form__field--full">
          <label className="form-label" htmlFor="contact_notes">Notes</label>
          <textarea id="contact_notes" className="form-input form-textarea" value={values.notes} onChange={(event) => updateField("notes", event.target.value)} placeholder="Referral context, follow-up reminders, or conversation notes" />
        </div>
      </div>
    </section>
  );
}
