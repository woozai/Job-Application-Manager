import type { KeyboardEvent, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";

import type { JobApplicationResponse } from "../../types/jobApplication";
import type { DashboardViewMode } from "../../hooks/useDashboardFilters";
import { getJobApplicationStatusTone } from "../../utils/jobApplicationStatusTone";
import { StatusBadge } from "../ui/StatusBadge";

interface JobApplicationCardProps {
  jobApplication: JobApplicationResponse;
  isActionLoading?: boolean;
  onArchive?: (jobApplication: JobApplicationResponse) => void;
  onRestore?: (jobApplication: JobApplicationResponse) => void;
  viewMode?: DashboardViewMode;
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

export function JobApplicationCard({
  jobApplication,
  isActionLoading = false,
  onArchive,
  onRestore,
  viewMode = "active",
}: JobApplicationCardProps) {
  const navigate = useNavigate();
  const followUpState = getFollowUpState(jobApplication);
  const contactsCount = jobApplication.contacts.length;
  const isArchiveView = viewMode === "archived";
  const actionLabel = isArchiveView ? "Restore" : "Archive";

  function openDetails() {
    void navigate(`/job-applications/${jobApplication.id}`);
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    openDetails();
  }

  function handleActionClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (isActionLoading) {
      return;
    }

    if (isArchiveView) {
      onRestore?.(jobApplication);
      return;
    }

    onArchive?.(jobApplication);
  }

  return (
    <article
      aria-label={`Open details for ${jobApplication.company_name} ${jobApplication.job_title}`}
      className="dashboard-job-card"
      onClick={openDetails}
      onKeyDown={handleCardKeyDown}
      role="link"
      tabIndex={0}
    >
      <div className="dashboard-job-card__header">
        <div>
          <p className="dashboard-job-card__company">{jobApplication.company_name}</p>
          <h3>{jobApplication.job_title}</h3>
        </div>
        <StatusBadge
          className="dashboard-job-card__status"
          label={jobApplication.status}
          tone={getJobApplicationStatusTone(jobApplication.status)}
        />
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
        <div className="dashboard-job-card__footer-actions">
          <span className="dashboard-job-card__cta">Open details</span>
          <button
            className="button-link dashboard-job-card__action-button"
            disabled={isActionLoading}
            onClick={handleActionClick}
            type="button"
          >
            {isActionLoading ? `${actionLabel}...` : actionLabel}
          </button>
        </div>
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
    </article>
  );
}
