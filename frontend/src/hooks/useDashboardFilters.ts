import { useMemo, useState } from "react";

import {
  getJobApplicationApplicationTypeMetadata,
  normalizeJobApplicationApplicationType,
  type JobApplicationApplicationType,
  type JobApplicationResponse,
} from "../types/jobApplication";

export type DashboardViewMode = "active" | "archived";
export type DashboardApplicationTypeFilterValue = "all" | JobApplicationApplicationType;

export function getDashboardApplicationTypeOptions(
  scopedJobApplications: JobApplicationResponse[],
) {
  const applicationTypeValues = new Set<JobApplicationApplicationType>();

  for (const jobApplication of scopedJobApplications) {
    const applicationType = normalizeJobApplicationApplicationType(jobApplication.application_type);
    if (applicationType) {
      applicationTypeValues.add(applicationType);
    }
  }

  return Array.from(applicationTypeValues)
    .map((applicationType) => getJobApplicationApplicationTypeMetadata(applicationType))
    .filter((applicationType): applicationType is NonNullable<typeof applicationType> => Boolean(applicationType))
    .sort((left, right) => left.label.localeCompare(right.label));
}

interface DashboardJobApplicationFilterParams {
  applicationTypeFilter: DashboardApplicationTypeFilterValue;
  companyFilter: string;
  dateFromFilter: string;
  dateToFilter: string;
  jobApplications: JobApplicationResponse[];
  searchTerm: string;
  statusFilter: string;
}

export function filterDashboardJobApplications({
  applicationTypeFilter,
  companyFilter,
  dateFromFilter,
  dateToFilter,
  jobApplications,
  searchTerm,
  statusFilter,
}: DashboardJobApplicationFilterParams) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return jobApplications.filter((jobApplication) => {
    const applicationDate = jobApplication.application_date ?? "";

    return (
      (normalizedSearch.length === 0 ||
        [jobApplication.company_name, jobApplication.job_title, jobApplication.short_description ?? "", jobApplication.notes ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)) &&
      (statusFilter === "all" || (jobApplication.status ?? "").trim() === statusFilter) &&
      (companyFilter === "all" || jobApplication.company_name.trim() === companyFilter) &&
      (
        applicationTypeFilter === "all" ||
        normalizeJobApplicationApplicationType(jobApplication.application_type) ===
          applicationTypeFilter
      ) &&
      (!dateFromFilter || (applicationDate !== "" && applicationDate >= dateFromFilter)) &&
      (!dateToFilter || (applicationDate !== "" && applicationDate <= dateToFilter))
    );
  });
}

export function useDashboardFilters(
  jobApplications: JobApplicationResponse[],
  viewMode: DashboardViewMode,
) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [applicationTypeFilter, setApplicationTypeFilter] =
    useState<DashboardApplicationTypeFilterValue>("all");
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

    for (const jobApplication of scopedJobApplications) {
      if (jobApplication.company_name.trim()) {
        companies.add(jobApplication.company_name.trim());
      }
      if ((jobApplication.status ?? "").trim()) {
        statuses.add((jobApplication.status ?? "").trim());
      }
    }

    return {
      applicationTypes: getDashboardApplicationTypeOptions(scopedJobApplications),
      companies: Array.from(companies).sort((left, right) => left.localeCompare(right)),
      statuses: Array.from(statuses).sort((left, right) => left.localeCompare(right)),
    };
  }, [scopedJobApplications]);

  const filteredJobApplications = useMemo(() => {
    return filterDashboardJobApplications({
      applicationTypeFilter,
      companyFilter,
      dateFromFilter,
      dateToFilter,
      jobApplications: scopedJobApplications,
      searchTerm,
      statusFilter,
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
