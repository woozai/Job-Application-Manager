import { Link } from "react-router-dom";

import type { JobApplicationResponse } from "../../types/jobApplication";

interface JobApplicationCardProps {
  jobApplication: JobApplicationResponse;
}

function formatDisplayDate(value: string | null) {
  if (!value) {
    return "No date yet";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getFollowUpState(jobApplication: JobApplicationResponse) {
  if (!jobApplication.next_action_date) {
    return null;
  }

  const nextActionDate = new Date(jobApplication.next_action_date);
  const today = new Date();
  nextActionDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(nextActionDate.getTime())) {
    return null;
  }

  return nextActionDate <= today ? "Follow-up due" : "Upcoming action";
}

export function JobApplicationCard({ jobApplication }: JobApplicationCardProps) {
  const followUpState = getFollowUpState(jobApplication);
  const contactsCount = jobApplication.contacts.length;

  return (
    <Link
      aria-label={`Open details for ${jobApplication.company_name} ${jobApplication.job_title}`}
      className="dashboard-job-card"
      to={`/job-applications/${jobApplication.id}`}
    >
      <div className="dashboard-job-card__header">
        <div>
          <p className="dashboard-job-card__company">{jobApplication.company_name}</p>
          <h3>{jobApplication.job_title}</h3>
        </div>
        <span className="dashboard-job-card__status">{jobApplication.status ?? "saved"}</span>
      </div>

      <p className="dashboard-job-card__description">
        {jobApplication.short_description?.trim() ||
          "No short description yet. Add details to keep this opportunity easy to scan."}
      </p>

      <dl className="dashboard-job-card__meta">
        <div>
          <dt>Applied</dt>
          <dd>{formatDisplayDate(jobApplication.application_date)}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{jobApplication.location || "Not set"}</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>{jobApplication.source || "Not set"}</dd>
        </div>
      </dl>

      <div className="dashboard-job-card__badges">
        {jobApplication.interview_stage ? (
          <span className="dashboard-badge">Stage: {jobApplication.interview_stage}</span>
        ) : null}
        {followUpState ? <span className="dashboard-badge">{followUpState}</span> : null}
      </div>

      <div className="dashboard-job-card__footer">
        <span className="dashboard-job-card__cta">Open details</span>
        <span
          aria-label={`${contactsCount} ${contactsCount === 1 ? "contact" : "contacts"}`}
          className="dashboard-badge dashboard-badge--contacts"
          title={`${contactsCount} ${contactsCount === 1 ? "contact" : "contacts"}`}
        >
          <svg
            aria-hidden="true"
            className="dashboard-badge__icon"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M16 19a4 4 0 0 0-8 0"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
            <path
              d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M20 18a3 3 0 0 0-3-3"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
            <path
              d="M17 11a2.5 2.5 0 0 0 0-5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
          <span className="dashboard-badge__count">{contactsCount}</span>
        </span>
      </div>
    </Link>
  );
}
