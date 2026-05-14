import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPayload,
  type JobApplicationFormValues,
} from "../src/components/job-applications/jobApplicationFormShared";
import {
  filterDashboardJobApplications,
  getDashboardApplicationTypeOptions,
} from "../src/hooks/useDashboardFilters";
import type { JobApplicationResponse } from "../src/types/jobApplication";

function createFormValues(
  overrides: Partial<JobApplicationFormValues> = {},
): JobApplicationFormValues {
  return {
    extraction_mode: "link",
    extraction_link: "",
    extraction_raw_text: "",
    company_name: "OpenAI",
    job_title: "Engineer",
    job_link: "",
    source: "",
    application_date: "",
    status: "saved",
    short_description: "",
    full_description: "",
    required_skills: "",
    notes: "",
    location: "",
    work_mode: "",
    application_type: "",
    priority: "",
    salary_range: "",
    resume_version: "",
    recruiter_name: "",
    last_follow_up_date: "",
    next_action_date: "",
    interview_stage: "",
    rejection_reason: "",
    ...overrides,
  };
}

function createJobApplication(
  overrides: Partial<JobApplicationResponse> = {},
): JobApplicationResponse {
  return {
    id: 1,
    user_id: 1,
    company_name: "OpenAI",
    job_title: "Engineer",
    job_link: null,
    source: null,
    application_date: "2026-05-14",
    status: "saved",
    short_description: null,
    full_description: null,
    required_skills: null,
    notes: null,
    location: null,
    work_mode: null,
    application_type: null,
    priority: null,
    salary_range: null,
    resume_version: null,
    recruiter_name: null,
    last_follow_up_date: null,
    next_action_date: null,
    interview_stage: null,
    rejection_reason: null,
    is_archived: false,
    archived_at: null,
    archive_reason: null,
    contacts: [],
    created_at: "2026-05-14T00:00:00Z",
    updated_at: "2026-05-14T00:00:00Z",
    ...overrides,
  };
}

test("buildPayload submits canonical application type values", () => {
  const payload = buildPayload(
    createFormValues({
      application_type: "through_connection",
    }),
  );

  assert.equal(payload.application_type, "through_connection");
});

test("dashboard application type filter options use canonical metadata only", () => {
  const options = getDashboardApplicationTypeOptions([
    createJobApplication({ id: 1, application_type: "direct_from_site" }),
    createJobApplication({ id: 2, application_type: "through_connection" }),
  ]);

  assert.deepEqual(
    options.map((option) => option.value),
    ["direct_from_site", "through_connection"],
  );
  assert.deepEqual(
    options.map((option) => option.label),
    ["Direct from site", "Through connection"],
  );
});

test("dashboard application type filtering matches canonical stored values", () => {
  const filtered = filterDashboardJobApplications({
    applicationTypeFilter: "direct_from_site",
    companyFilter: "all",
    dateFromFilter: "",
    dateToFilter: "",
    jobApplications: [
      createJobApplication({ id: 1, company_name: "Canonical", application_type: "direct_from_site" }),
      createJobApplication({ id: 2, company_name: "Other", application_type: "through_connection" }),
    ],
    searchTerm: "",
    statusFilter: "all",
  });

  assert.deepEqual(
    filtered.map((jobApplication) => jobApplication.company_name),
    ["Canonical"],
  );
});
