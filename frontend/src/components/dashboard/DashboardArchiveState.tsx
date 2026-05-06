import { Link } from "react-router-dom";

import type { DashboardViewMode } from "../../hooks/useDashboardFilters";

interface DashboardArchiveEmptyStateProps {
  isArchiveView: boolean;
  mode: "no-active-jobs" | "no-archived-jobs" | "no-filter-results";
  onResetFilters?: () => void;
  onSwitchView?: (viewMode: DashboardViewMode) => void;
}

export function DashboardArchiveEmptyState({
  isArchiveView,
  mode,
  onResetFilters,
  onSwitchView,
}: DashboardArchiveEmptyStateProps) {
  if (mode === "no-active-jobs") {
    return (
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
          <button className="button-link" onClick={() => onSwitchView?.("archived")} type="button">
            View archived jobs
          </button>
        </div>
      </section>
    );
  }

  if (mode === "no-archived-jobs") {
    return (
      <section className="page-card dashboard-empty-state">
        <p className="page-card__eyebrow">Archive empty</p>
        <h2>No archived jobs yet</h2>
        <p className="page-card__body">
          Archived applications will appear here once you move them out of the active dashboard.
        </p>
        <button className="button-link" onClick={() => onSwitchView?.("active")} type="button">
          Back to active jobs
        </button>
      </section>
    );
  }

  return (
    <section className="page-card dashboard-empty-state">
      <p className="page-card__eyebrow">No matching results</p>
      <h2>{isArchiveView ? "No archived jobs match your filters" : "No active jobs match your filters"}</h2>
      <p className="page-card__body">
        {isArchiveView
          ? "Try broadening your search or clearing a filter to see more archived opportunities."
          : "Try broadening your search or clearing a filter to see more active opportunities."}
      </p>
      <button className="button-link" onClick={onResetFilters} type="button">
        Reset filters
      </button>
    </section>
  );
}
