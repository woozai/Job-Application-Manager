import { useMemo, useState } from "react";

import type { JobApplicationResponse } from "../types/jobApplication";

export function useDashboardFilters(jobApplications: JobApplicationResponse[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [applicationTypeFilter, setApplicationTypeFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

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
      for (const tag of (jobApplication.tags ?? "").split(",").map((value) => value.trim()).filter(Boolean)) {
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
      const parsedTags = (jobApplication.tags ?? "").split(",").map((tag) => tag.trim()).filter(Boolean);
      const applicationDate = jobApplication.application_date ?? "";

      return (
        (normalizedSearch.length === 0 ||
          [jobApplication.company_name, jobApplication.job_title, jobApplication.short_description ?? "", jobApplication.notes ?? "", jobApplication.tags ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)) &&
        (statusFilter === "all" || (jobApplication.status ?? "").trim() === statusFilter) &&
        (companyFilter === "all" || jobApplication.company_name.trim() === companyFilter) &&
        (tagFilter === "all" || parsedTags.includes(tagFilter)) &&
        (applicationTypeFilter === "all" || (jobApplication.application_type ?? "").trim() === applicationTypeFilter) &&
        (!dateFromFilter || (applicationDate !== "" && applicationDate >= dateFromFilter)) &&
        (!dateToFilter || (applicationDate !== "" && applicationDate <= dateToFilter))
      );
    });
  }, [applicationTypeFilter, companyFilter, dateFromFilter, dateToFilter, jobApplications, searchTerm, statusFilter, tagFilter]);

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

  return {
    applicationTypeFilter,
    companyFilter,
    dateFromFilter,
    dateToFilter,
    filterOptions,
    filteredJobApplications,
    hasActiveFilters,
    resetFilters,
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
  };
}
