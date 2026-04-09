interface DashboardFiltersPanelProps {
  applicationTypeFilter: string;
  companyFilter: string;
  dateFromFilter: string;
  dateToFilter: string;
  filterOptions: {
    applicationTypes: string[];
    companies: string[];
    statuses: string[];
    tags: string[];
  };
  hasActiveFilters: boolean;
  onClose: () => void;
  onReset: () => void;
  searchTerm: string;
  setApplicationTypeFilter: (value: string) => void;
  setCompanyFilter: (value: string) => void;
  setDateFromFilter: (value: string) => void;
  setDateToFilter: (value: string) => void;
  setSearchTerm: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setTagFilter: (value: string) => void;
  statusFilter: string;
  tagFilter: string;
}

export function DashboardFiltersPanel({
  applicationTypeFilter,
  companyFilter,
  dateFromFilter,
  dateToFilter,
  filterOptions,
  hasActiveFilters,
  onClose,
  onReset,
  searchTerm,
  setApplicationTypeFilter,
  setCompanyFilter,
  setDateFromFilter,
  setDateToFilter,
  setSearchTerm,
  setStatusFilter,
  setTagFilter,
  statusFilter,
  tagFilter,
}: DashboardFiltersPanelProps) {
  return (
    <section className="page-card dashboard-filters">
      <div className="dashboard-filters__header">
        <div>
          <p className="page-card__eyebrow">Search and filters</p>
          <h2>Find the right opportunity faster</h2>
        </div>
        <div className="dashboard-filters__actions">
          <button className="button-link" disabled={!hasActiveFilters} onClick={onReset} type="button">Clear filters</button>
          <button className="button-link" onClick={onClose} type="button">Close filters</button>
        </div>
      </div>

      <div className="dashboard-filters__grid">
        <div className="form-field">
          <label className="form-label" htmlFor="dashboard-search">Keyword</label>
          <input id="dashboard-search" className="form-input" onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search company, title, notes, or tags" type="search" value={searchTerm} />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="dashboard-status-filter">Status</label>
          <select id="dashboard-status-filter" className="form-input" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
            <option value="all">All statuses</option>
            {filterOptions.statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="dashboard-company-filter">Company</label>
          <select id="dashboard-company-filter" className="form-input" onChange={(event) => setCompanyFilter(event.target.value)} value={companyFilter}>
            <option value="all">All companies</option>
            {filterOptions.companies.map((company) => <option key={company} value={company}>{company}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="dashboard-tag-filter">Tag</label>
          <select id="dashboard-tag-filter" className="form-input" onChange={(event) => setTagFilter(event.target.value)} value={tagFilter}>
            <option value="all">All tags</option>
            {filterOptions.tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="dashboard-application-type-filter">Application type</label>
          <select id="dashboard-application-type-filter" className="form-input" onChange={(event) => setApplicationTypeFilter(event.target.value)} value={applicationTypeFilter}>
            <option value="all">All application types</option>
            {filterOptions.applicationTypes.map((applicationType) => <option key={applicationType} value={applicationType}>{applicationType}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="dashboard-date-from-filter">Date from</label>
          <input id="dashboard-date-from-filter" className="form-input" onChange={(event) => setDateFromFilter(event.target.value)} type="date" value={dateFromFilter} />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="dashboard-date-to-filter">Date to</label>
          <input id="dashboard-date-to-filter" className="form-input" onChange={(event) => setDateToFilter(event.target.value)} type="date" value={dateToFilter} />
        </div>
      </div>
    </section>
  );
}
