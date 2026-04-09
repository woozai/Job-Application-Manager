import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { getJobApplications } from "../api/jobApplications";
import { ApiError } from "../api/client";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { useAuth } from "../hooks/useAuth";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { JobApplicationResponse } from "../types/jobApplication";

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

export function DashboardPage() {
  useDocumentTitle("Dashboard | Job Application Manager");
  const { currentUser, token } = useAuth();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [jobApplications, setJobApplications] = useState<JobApplicationResponse[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [createMessage, setCreateMessage] = useState<string | null>(null);

  useEffect(() => {
    const routeState = location.state as { successMessage?: string } | null;

    if (routeState?.successMessage) {
      setSuccessMessage(routeState.successMessage);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.pathname, location.state]);

  useEffect(() => {
    async function loadJobApplications() {
      if (!token) {
        setJobApplications([]);
        setIsLoadingApplications(false);
        return;
      }

      setIsLoadingApplications(true);
      setLoadError(null);

      try {
        const applications = await getJobApplications(token);
        setJobApplications(applications);
      } catch (error) {
        if (error instanceof ApiError) {
          setLoadError(error.message);
        } else {
          setLoadError("We could not load your job applications.");
        }
      } finally {
        setIsLoadingApplications(false);
      }
    }

    void loadJobApplications();
  }, [token]);

  const dashboardStats = useMemo(() => {
    const activeApplications = jobApplications.filter(
      (jobApplication) => jobApplication.status !== "rejected" && jobApplication.status !== "archived",
    ).length;
    const interviewCount = jobApplications.filter((jobApplication) =>
      (jobApplication.interview_stage ?? "").trim().length > 0,
    ).length;
    const contactsCount = jobApplications.reduce(
      (total, jobApplication) => total + jobApplication.contacts.length,
      0,
    );

    return [
      { label: "Applications", value: jobApplications.length },
      { label: "Active", value: activeApplications },
      { label: "Interview tracks", value: interviewCount },
      { label: "Contacts", value: contactsCount },
    ];
  }, [jobApplications]);

  return (
    <div className="page-stack">
      {successMessage ? (
        <section className="feedback-panel feedback-panel--success" role="status">
          <p className="feedback-panel__eyebrow">Success</p>
          <h3>Welcome back</h3>
          <p>{successMessage}</p>
        </section>
      ) : null}

      <section className="page-card dashboard-hero">
        <div className="dashboard-hero__content">
          <p className="page-card__eyebrow">Dashboard</p>
          <h2>Track every opportunity in one place</h2>
          <p className="page-card__body">
            {currentUser
              ? `Welcome back, ${currentUser.username}. Your dashboard now loads live job applications from the backend and keeps your search organized.`
              : "Your dashboard keeps applications, networking activity, and next steps in one focused workspace."}
          </p>
        </div>

        <div className="dashboard-hero__actions">
          <button
            className="button-link button-link--primary"
            onClick={() =>
              setCreateMessage("The create application form is the next task and will be connected here.")
            }
            type="button"
          >
            Create new application
          </button>
          <p className="dashboard-hero__hint">This entry point is ready for the upcoming create flow.</p>
        </div>
      </section>

      {createMessage ? (
        <section className="feedback-panel" role="status">
          <p className="feedback-panel__eyebrow">Next step</p>
          <h3>Create application</h3>
          <p>{createMessage}</p>
        </section>
      ) : null}

      <section className="dashboard-stats" aria-label="Dashboard summary">
        {dashboardStats.map((stat) => (
          <article key={stat.label} className="dashboard-stat-card">
            <p className="dashboard-stat-card__label">{stat.label}</p>
            <strong className="dashboard-stat-card__value">{stat.value}</strong>
          </article>
        ))}
      </section>

      {isLoadingApplications ? (
        <LoadingState
          title="Loading job applications"
          message="Fetching your latest opportunities and building your dashboard."
        />
      ) : null}

      {!isLoadingApplications && loadError ? (
        <ErrorState title="Could not load applications" message={loadError} />
      ) : null}

      {!isLoadingApplications && !loadError && jobApplications.length === 0 ? (
        <section className="page-card dashboard-empty-state">
          <p className="page-card__eyebrow">No applications yet</p>
          <h2>Your dashboard is ready for the first opportunity</h2>
          <p className="page-card__body">
            Once you start adding jobs, they will show up here with status, dates, and follow-up
            context.
          </p>
          <button
            className="button-link button-link--primary"
            onClick={() =>
              setCreateMessage("The create application form is the next task and will be connected here.")
            }
            type="button"
          >
            Create your first application
          </button>
        </section>
      ) : null}

      {!isLoadingApplications && !loadError && jobApplications.length > 0 ? (
        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <div>
              <p className="page-card__eyebrow">Applications</p>
              <h2>Recent opportunities</h2>
            </div>
            <p className="dashboard-section__meta">{jobApplications.length} total loaded</p>
          </div>

          <div className="dashboard-grid">
            {jobApplications.map((jobApplication) => {
              const followUpState = getFollowUpState(jobApplication);

              return (
                <article key={jobApplication.id} className="dashboard-job-card">
                  <div className="dashboard-job-card__header">
                    <div>
                      <p className="dashboard-job-card__company">{jobApplication.company_name}</p>
                      <h3>{jobApplication.job_title}</h3>
                    </div>
                    <span className="dashboard-job-card__status">
                      {jobApplication.status ?? "saved"}
                    </span>
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
                    {jobApplication.contacts.length > 0 ? (
                      <span className="dashboard-badge">{jobApplication.contacts.length} contacts</span>
                    ) : null}
                    {followUpState ? <span className="dashboard-badge">{followUpState}</span> : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
