import { useMemo, useState } from "react";

import type { JobApplicationResponse } from "../types/jobApplication";

export type DashboardViewMode = "active" | "archived";

export function useDashboardFilters(
  jobApplications: JobApplicationResponse[],
  viewMode: DashboardViewMode,
) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [applicationTypeFilter, setApplicationTypeFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const scopedJobApplications = useMemo(
    () =>
      jobApplications.filter((jobApplication) =>
        viewMode === "archived" ? jobApplication.is_archived : !jobApplication.is_archived,
      ),
    [jobApplications, viewMode],
  );

  const filterOptions = useMemo(() => {
    const companies = new Set<string>();
    const statuses = new Set<string>();
    const applicationTypes = new Set<string>();

    for (const jobApplication of scopedJobApplications) {
      if (jobApplication.company_name.trim()) {
        companies.add(jobApplication.company_name.trim());
      }
      if ((jobApplication.status ?? "").trim()) {
        statuses.add((jobApplication.status ?? "").trim());
      }
      if ((jobApplication.application_type ?? "").trim()) {
        applicationTypes.add((jobApplication.application_type ?? "").trim());
      }
    }

    return {
      companies: Array.from(companies).sort((left, right) => left.localeCompare(right)),
      statuses: Array.from(statuses).sort((left, right) => left.localeCompare(right)),
      applicationTypes: Array.from(applicationTypes).sort((left, right) => left.localeCompare(right)),
    };
  }, [scopedJobApplications]);

  const filteredJobApplications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return scopedJobApplications.filter((jobApplication) => {
      const applicationDate = jobApplication.application_date ?? "";

      return (
        (normalizedSearch.length === 0 ||
          [jobApplication.company_name, jobApplication.job_title, jobApplication.short_description ?? "", jobApplication.notes ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)) &&
        (statusFilter === "all" || (jobApplication.status ?? "").trim() === statusFilter) &&
        (companyFilter === "all" || jobApplication.company_name.trim() === companyFilter) &&
        (applicationTypeFilter === "all" || (jobApplication.application_type ?? "").trim() === applicationTypeFilter) &&
        (!dateFromFilter || (applicationDate !== "" && applicationDate >= dateFromFilter)) &&
        (!dateToFilter || (applicationDate !== "" && applicationDate <= dateToFilter))
      );
    });
  }, [applicationTypeFilter, companyFilter, dateFromFilter, dateToFilter, scopedJobApplications, searchTerm, statusFilter]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    statusFilter !== "all" ||
    companyFilter !== "all" ||
    applicationTypeFilter !== "all" ||
    dateFromFilter.length > 0 ||
    dateToFilter.length > 0;

  function resetFilters() {
    setSearchTerm("");
    setStatusFilter("all");
    setCompanyFilter("all");
    setApplicationTypeFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
  }

  return {
    applicationTypeFilter,
    companyFilter,
    dateFromFilter,
    dateToFilter,
    filterOptions,
    filteredJobApplications,
    hasActiveFilters,
    resetFilters,
    scopedJobApplications,
    searchTerm,
    setApplicationTypeFilter,
    setCompanyFilter,
    setDateFromFilter,
    setDateToFilter,
    setSearchTerm,
    setStatusFilter,
    statusFilter,
  };
}
