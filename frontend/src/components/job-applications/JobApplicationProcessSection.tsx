import type { JobApplicationFormValues } from "./jobApplicationFormShared";
import { applicationTypeOptions, priorityOptions, workModeOptions } from "./jobApplicationFormShared";

interface JobApplicationProcessSectionProps {
  updateField: <K extends keyof JobApplicationFormValues>(field: K, value: JobApplicationFormValues[K]) => void;
  values: JobApplicationFormValues;
}

export function JobApplicationProcessSection({ updateField, values }: JobApplicationProcessSectionProps) {
  return (
    <section className="job-form__section">
      <div className="job-form__section-header">
        <h3>Process tracking</h3>
        <p>Track how the application is moving and what needs follow-up.</p>
      </div>

      <div className="job-form__grid">
        <div className="form-field">
          <label className="form-label" htmlFor="work_mode">Work mode</label>
          <select id="work_mode" className="form-input" value={values.work_mode} onChange={(event) => updateField("work_mode", event.target.value)}>
            <option value="">Not set</option>
            {workModeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="application_type">Application type</label>
          <select
            id="application_type"
            className="form-input"
            value={values.application_type}
            onChange={(event) =>
              updateField(
                "application_type",
                event.target.value as JobApplicationFormValues["application_type"],
              )
            }
          >
            <option value="">Not set</option>
            {applicationTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="priority">Priority</label>
          <select id="priority" className="form-input" value={values.priority} onChange={(event) => updateField("priority", event.target.value)}>
            <option value="">Not set</option>
            {priorityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="salary_range">Salary range</label>
          <input id="salary_range" className="form-input" value={values.salary_range} onChange={(event) => updateField("salary_range", event.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="resume_version">Resume version</label>
          <input id="resume_version" className="form-input" value={values.resume_version} onChange={(event) => updateField("resume_version", event.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="recruiter_name">Recruiter name</label>
          <input id="recruiter_name" className="form-input" value={values.recruiter_name} onChange={(event) => updateField("recruiter_name", event.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="last_follow_up_date">Last follow-up date</label>
          <input id="last_follow_up_date" className="form-input" type="date" value={values.last_follow_up_date} onChange={(event) => updateField("last_follow_up_date", event.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="next_action_date">Next action date</label>
          <input id="next_action_date" className="form-input" type="date" value={values.next_action_date} onChange={(event) => updateField("next_action_date", event.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="interview_stage">Interview stage</label>
          <input id="interview_stage" className="form-input" value={values.interview_stage} onChange={(event) => updateField("interview_stage", event.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="rejection_reason">Rejection reason</label>
          <input id="rejection_reason" className="form-input" value={values.rejection_reason} onChange={(event) => updateField("rejection_reason", event.target.value)} />
        </div>
      </div>
    </section>
  );
}
