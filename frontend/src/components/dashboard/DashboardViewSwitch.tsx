import type { DashboardViewMode } from "../../hooks/useDashboardFilters";

interface DashboardViewSwitchProps {
  viewMode: DashboardViewMode;
  onChange: (viewMode: DashboardViewMode) => void;
}

export function DashboardViewSwitch({
  viewMode,
  onChange,
}: DashboardViewSwitchProps) {
  return (
    <div className="dashboard-view-switch" role="tablist" aria-label="Dashboard job views">
      <button
        aria-selected={viewMode === "active"}
        className={`button-link dashboard-view-switch__button${viewMode === "active" ? " dashboard-view-switch__button--active" : ""}`}
        onClick={() => onChange("active")}
        role="tab"
        type="button"
      >
        Active jobs
      </button>
      <button
        aria-selected={viewMode === "archived"}
        className={`button-link dashboard-view-switch__button${viewMode === "archived" ? " dashboard-view-switch__button--active" : ""}`}
        onClick={() => onChange("archived")}
        role="tab"
        type="button"
      >
        Archived jobs
      </button>
    </div>
  );
}
