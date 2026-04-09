import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { getJobApplications } from "../api/jobApplications";
import { ApiError } from "../api/client";
import { JobApplicationCard } from "../components/job-applications/JobApplicationCard";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { useAuth } from "../hooks/useAuth";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { JobApplicationResponse } from "../types/jobApplication";

export function DashboardPage() {
  useDocumentTitle("Dashboard | Job Application Manager");
  const { currentUser, token } = useAuth();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [jobApplications, setJobApplications] = useState<JobApplicationResponse[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [applicationTypeFilter, setApplicationTypeFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const isCreatePanelOpen = createMessage !== null;

  function toggleCreatePanel() {
    setCreateMessage((currentMessage) =>
      currentMessage
        ? null
        : "The create application form is the next task and will be connected here.",
    );
  }

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

  const filterOptions = useMemo(() => {
    const companies = new Set<string>();
    const statuses = new Set<string>();
    const applicationTypes = new Set<string>();
    const tags = new Set<string>();

    for (const jobApplication of jobApplications) {
      if (jobApplication.company_name.trim()) {
        companies.add(jobApplication.company_name.trim());
      }

      if ((jobApplication.status ?? "").trim()) {
        statuses.add((jobApplication.status ?? "").trim());
      }

      if ((jobApplication.application_type ?? "").trim()) {
        applicationTypes.add((jobApplication.application_type ?? "").trim());
      }

      const parsedTags = (jobApplication.tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      for (const tag of parsedTags) {
        tags.add(tag);
      }
    }

    return {
      companies: Array.from(companies).sort((left, right) => left.localeCompare(right)),
      statuses: Array.from(statuses).sort((left, right) => left.localeCompare(right)),
      applicationTypes: Array.from(applicationTypes).sort((left, right) => left.localeCompare(right)),
      tags: Array.from(tags).sort((left, right) => left.localeCompare(right)),
    };
  }, [jobApplications]);

  const filteredJobApplications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return jobApplications.filter((jobApplication) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          jobApplication.company_name,
          jobApplication.job_title,
          jobApplication.short_description ?? "",
          jobApplication.notes ?? "",
          jobApplication.tags ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || (jobApplication.status ?? "").trim() === statusFilter;

      const matchesCompany = companyFilter === "all" || jobApplication.company_name.trim() === companyFilter;

      const parsedTags = (jobApplication.tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const matchesTag = tagFilter === "all" || parsedTags.includes(tagFilter);

      const matchesApplicationType =
        applicationTypeFilter === "all" ||
        (jobApplication.application_type ?? "").trim() === applicationTypeFilter;

      const applicationDate = jobApplication.application_date ?? "";
      const matchesDateFrom = !dateFromFilter || (applicationDate !== "" && applicationDate >= dateFromFilter);
      const matchesDateTo = !dateToFilter || (applicationDate !== "" && applicationDate <= dateToFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCompany &&
        matchesTag &&
        matchesApplicationType &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [
    applicationTypeFilter,
    companyFilter,
    dateFromFilter,
    dateToFilter,
    jobApplications,
    searchTerm,
    statusFilter,
    tagFilter,
  ]);

  const dashboardStats = useMemo(() => {
    const activeApplications = filteredJobApplications.filter(
      (jobApplication) => jobApplication.status !== "rejected" && jobApplication.status !== "archived",
    ).length;
    const interviewCount = filteredJobApplications.filter((jobApplication) =>
      (jobApplication.interview_stage ?? "").trim().length > 0,
    ).length;
    const contactsCount = filteredJobApplications.reduce(
      (total, jobApplication) => total + jobApplication.contacts.length,
      0,
    );

    return [
      { label: "Applications", value: filteredJobApplications.length },
      { label: "Active", value: activeApplications },
      { label: "Interview tracks", value: interviewCount },
      { label: "Contacts", value: contactsCount },
    ];
  }, [filteredJobApplications]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    statusFilter !== "all" ||
    companyFilter !== "all" ||
    tagFilter !== "all" ||
    applicationTypeFilter !== "all" ||
    dateFromFilter.length > 0 ||
    dateToFilter.length > 0;

  function resetFilters() {
    setSearchTerm("");
    setStatusFilter("all");
    setCompanyFilter("all");
    setTagFilter("all");
    setApplicationTypeFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
  }

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
            onClick={toggleCreatePanel}
            type="button"
          >
            {isCreatePanelOpen ? "Close create panel" : "Create new application"}
          </button>
          <p className="dashboard-hero__hint">This entry point is ready for the upcoming create flow.</p>
        </div>
      </section>

      {createMessage ? (
        <section className="feedback-panel" role="status">
          <div className="feedback-panel__header">
            <div>
              <p className="feedback-panel__eyebrow">Next step</p>
              <h3>Create application</h3>
            </div>
            <button className="button-link" onClick={toggleCreatePanel} type="button">
              Close
            </button>
          </div>
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

      {!isLoadingApplications && !loadError && jobApplications.length > 0 ? (
        <section className="page-card dashboard-filters">
          <div className="dashboard-filters__header">
            <div>
              <p className="page-card__eyebrow">Search and filters</p>
              <h2>Find the right opportunity faster</h2>
            </div>
            <button className="button-link" disabled={!hasActiveFilters} onClick={resetFilters} type="button">
              Clear filters
            </button>
          </div>

          <div className="dashboard-filters__grid">
            <div className="form-field">
              <label className="form-label" htmlFor="dashboard-search">
                Keyword
              </label>
              <input
                id="dashboard-search"
                className="form-input"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search company, title, notes, or tags"
                type="search"
                value={searchTerm}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="dashboard-status-filter">
                Status
              </label>
              <select
                id="dashboard-status-filter"
                className="form-input"
                onChange={(event) => setStatusFilter(event.target.value)}
                value={statusFilter}
              >
                <option value="all">All statuses</option>
                {filterOptions.statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="dashboard-company-filter">
                Company
              </label>
              <select
                id="dashboard-company-filter"
                className="form-input"
                onChange={(event) => setCompanyFilter(event.target.value)}
                value={companyFilter}
              >
                <option value="all">All companies</option>
                {filterOptions.companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="dashboard-tag-filter">
                Tag
              </label>
              <select
                id="dashboard-tag-filter"
                className="form-input"
                onChange={(event) => setTagFilter(event.target.value)}
                value={tagFilter}
              >
                <option value="all">All tags</option>
                {filterOptions.tags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="dashboard-application-type-filter">
                Application type
              </label>
              <select
                id="dashboard-application-type-filter"
                className="form-input"
                onChange={(event) => setApplicationTypeFilter(event.target.value)}
                value={applicationTypeFilter}
              >
                <option value="all">All application types</option>
                {filterOptions.applicationTypes.map((applicationType) => (
                  <option key={applicationType} value={applicationType}>
                    {applicationType}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="dashboard-date-from-filter">
                Date from
              </label>
              <input
                id="dashboard-date-from-filter"
                className="form-input"
                onChange={(event) => setDateFromFilter(event.target.value)}
                type="date"
                value={dateFromFilter}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="dashboard-date-to-filter">
                Date to
              </label>
              <input
                id="dashboard-date-to-filter"
                className="form-input"
                onChange={(event) => setDateToFilter(event.target.value)}
                type="date"
                value={dateToFilter}
              />
            </div>
          </div>
        </section>
      ) : null}

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
            onClick={toggleCreatePanel}
            type="button"
          >
            {isCreatePanelOpen ? "Close create panel" : "Create your first application"}
          </button>
        </section>
      ) : null}

      {!isLoadingApplications && !loadError && jobApplications.length > 0 && filteredJobApplications.length === 0 ? (
        <section className="page-card dashboard-empty-state">
          <p className="page-card__eyebrow">No matching results</p>
          <h2>No applications match your current filters</h2>
          <p className="page-card__body">
            Try broadening your search or clearing one of the filters to see more opportunities.
          </p>
          <button className="button-link" onClick={resetFilters} type="button">
            Reset filters
          </button>
        </section>
      ) : null}

      {!isLoadingApplications && !loadError && filteredJobApplications.length > 0 ? (
        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <div>
              <p className="page-card__eyebrow">Applications</p>
              <h2>Recent opportunities</h2>
            </div>
            <p className="dashboard-section__meta">
              Showing {filteredJobApplications.length} of {jobApplications.length}
            </p>
          </div>

          <div className="dashboard-grid">
            {filteredJobApplications.map((jobApplication) => (
              <JobApplicationCard key={jobApplication.id} jobApplication={jobApplication} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
