import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  archiveJobApplication,
  getJobApplications,
  restoreJobApplication,
} from "../api/jobApplications";
import { ApiError } from "../api/client";
import { DashboardFiltersPanel } from "../components/dashboard/DashboardFiltersPanel";
import { DashboardStats } from "../components/dashboard/DashboardStats";
import { JobApplicationCard } from "../components/job-applications/JobApplicationCard";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { useAuth } from "../hooks/useAuth";
import { useDashboardFilters, type DashboardViewMode } from "../hooks/useDashboardFilters";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { JobApplicationResponse } from "../types/jobApplication";

export function DashboardPage() {
  useDocumentTitle("Dashboard | Job Application Manager");
  const { currentUser, token } = useAuth();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [jobApplications, setJobApplications] = useState<JobApplicationResponse[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [jobApplicationActionId, setJobApplicationActionId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<DashboardViewMode>("active");
  const filters = useDashboardFilters(jobApplications, viewMode);
  const isArchiveView = viewMode === "archived";

  useEffect(() => {
    const routeState = location.state as { successMessage?: string } | null;

    if (routeState?.successMessage) {
      setSuccessMessage(routeState.successMessage);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.pathname, location.state]);

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

  useEffect(() => {
    void loadJobApplications();
  }, [token]);

  function replaceJobApplication(updatedJobApplication: JobApplicationResponse) {
    setJobApplications((current) =>
      current.map((jobApplication) =>
        jobApplication.id === updatedJobApplication.id ? updatedJobApplication : jobApplication,
      ),
    );
  }

  async function handleArchive(jobApplication: JobApplicationResponse) {
    if (!token || jobApplicationActionId !== null) {
      return;
    }

    setJobApplicationActionId(jobApplication.id);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const updatedJobApplication = await archiveJobApplication(jobApplication.id, token);
      replaceJobApplication(updatedJobApplication);
      setSuccessMessage(`${jobApplication.company_name} was moved to archive.`);
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "We could not archive this job application. Please try again.",
      );
    } finally {
      setJobApplicationActionId(null);
    }
  }

  async function handleRestore(jobApplication: JobApplicationResponse) {
    if (!token || jobApplicationActionId !== null) {
      return;
    }

    setJobApplicationActionId(jobApplication.id);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const updatedJobApplication = await restoreJobApplication(jobApplication.id, token);
      replaceJobApplication(updatedJobApplication);
      setSuccessMessage(`${jobApplication.company_name} was restored to your active dashboard.`);
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "We could not restore this job application. Please try again.",
      );
    } finally {
      setJobApplicationActionId(null);
    }
  }

  return (
    <div className="page-stack">
      {successMessage ? (
        <section className="feedback-panel feedback-panel--success" role="status">
          <p className="feedback-panel__eyebrow">Success</p>
          <h3>Dashboard updated</h3>
          <p>{successMessage}</p>
        </section>
      ) : null}

      {actionError ? (
        <section className="feedback-panel feedback-panel--error" role="alert">
          <p className="feedback-panel__eyebrow">Could not update archive</p>
          <h3>Archive action failed</h3>
          <p>{actionError}</p>
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
          {jobApplications.length > 0 ? (
            <div className="dashboard-view-switch" role="tablist" aria-label="Dashboard job views">
              <button
                aria-selected={viewMode === "active"}
                className={`button-link dashboard-view-switch__button${viewMode === "active" ? " dashboard-view-switch__button--active" : ""}`}
                onClick={() => setViewMode("active")}
                role="tab"
                type="button"
              >
                Active jobs
              </button>
              <button
                aria-selected={viewMode === "archived"}
                className={`button-link dashboard-view-switch__button${viewMode === "archived" ? " dashboard-view-switch__button--active" : ""}`}
                onClick={() => setViewMode("archived")}
                role="tab"
                type="button"
              >
                Archived jobs
              </button>
            </div>
          ) : null}
        </div>

        <div className="dashboard-hero__actions">
          <Link className="button-link button-link--primary" to="/job-applications/new">
            Create new application
          </Link>
          {jobApplications.length > 0 ? (
            <button
              className="button-link dashboard-filters-toggle"
              onClick={() => setShowFilters((current) => !current)}
              type="button"
            >
              {showFilters ? "Close filters" : "Open filters"}
            </button>
          ) : null}
        </div>
      </section>

      <DashboardStats jobApplications={filters.filteredJobApplications} />

      {!isLoadingApplications && !loadError && jobApplications.length > 0 && showFilters ? (
        <DashboardFiltersPanel {...filters} onClose={() => setShowFilters(false)} onReset={filters.resetFilters} />
      ) : null}

      {isLoadingApplications ? (
        <LoadingState
          title="Loading job applications"
          message="Fetching your latest opportunities and building your dashboard."
        />
      ) : null}

      {!isLoadingApplications && loadError ? (
        <ErrorState
          title="Could not load applications"
          message={loadError}
          action={
            <button className="button-link" onClick={() => void loadJobApplications()} type="button">
              Try again
            </button>
          }
        />
      ) : null}

      {!isLoadingApplications && !loadError && !isArchiveView && jobApplications.length === 0 ? (
        <section className="page-card dashboard-empty-state">
          <p className="page-card__eyebrow">No applications yet</p>
          <h2>Your dashboard is ready for the first opportunity</h2>
          <p className="page-card__body">
            Once you start adding jobs, they will show up here with status, dates, and follow-up
            context.
          </p>
          <Link className="button-link button-link--primary" to="/job-applications/new">
            Create your first application
          </Link>
        </section>
      ) : null}

      {!isLoadingApplications &&
      !loadError &&
      !isArchiveView &&
      jobApplications.length > 0 &&
      filters.scopedJobApplications.length === 0 ? (
        <section className="page-card dashboard-empty-state">
          <p className="page-card__eyebrow">Active dashboard clear</p>
          <h2>No active jobs right now</h2>
          <p className="page-card__body">
            Your active dashboard is currently empty. You can create a new application or switch to
            archived jobs to review older opportunities.
          </p>
          <div className="dashboard-filters__actions">
            <Link className="button-link button-link--primary" to="/job-applications/new">
              Create new application
            </Link>
            <button className="button-link" onClick={() => setViewMode("archived")} type="button">
              View archived jobs
            </button>
          </div>
        </section>
      ) : null}

      {!isLoadingApplications &&
      !loadError &&
      isArchiveView &&
      filters.scopedJobApplications.length === 0 ? (
        <section className="page-card dashboard-empty-state">
          <p className="page-card__eyebrow">Archive empty</p>
          <h2>No archived jobs yet</h2>
          <p className="page-card__body">
            Archived applications will appear here once you move them out of the active dashboard.
          </p>
          <button className="button-link" onClick={() => setViewMode("active")} type="button">
            Back to active jobs
          </button>
        </section>
      ) : null}

      {!isLoadingApplications && !loadError && filters.scopedJobApplications.length > 0 && filters.filteredJobApplications.length === 0 ? (
        <section className="page-card dashboard-empty-state">
          <p className="page-card__eyebrow">No matching results</p>
          <h2>{isArchiveView ? "No archived jobs match your filters" : "No active jobs match your filters"}</h2>
          <p className="page-card__body">
            {isArchiveView
              ? "Try broadening your search or clearing a filter to see more archived opportunities."
              : "Try broadening your search or clearing a filter to see more active opportunities."}
          </p>
          <button className="button-link" onClick={filters.resetFilters} type="button">
            Reset filters
          </button>
        </section>
      ) : null}

      {!isLoadingApplications && !loadError && filters.filteredJobApplications.length > 0 ? (
        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <div>
              <p className="page-card__eyebrow">{isArchiveView ? "Archive" : "Applications"}</p>
              <h2>{isArchiveView ? "Archived opportunities" : "Recent opportunities"}</h2>
            </div>
            <p className="dashboard-section__meta">
              Showing {filters.filteredJobApplications.length} of {filters.scopedJobApplications.length}
            </p>
          </div>

          <div className="dashboard-grid">
            {filters.filteredJobApplications.map((jobApplication) => (
              <JobApplicationCard
                key={jobApplication.id}
                isActionLoading={jobApplicationActionId === jobApplication.id}
                jobApplication={jobApplication}
                onArchive={(currentJobApplication) => void handleArchive(currentJobApplication)}
                onRestore={(currentJobApplication) => void handleRestore(currentJobApplication)}
                viewMode={viewMode}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
