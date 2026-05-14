import type { ReactNode } from "react";

import { ExpandableText } from "../ui/ExpandableText";
import { MarkdownText } from "../ui/MarkdownText";
import {
  getJobApplicationApplicationTypeLabel,
  type JobApplicationResponse,
} from "../../types/jobApplication";
import { formatDisplayDate, formatDisplayValue } from "../../utils/display";
import { getJobApplicationStatusTone } from "../../utils/jobApplicationStatusTone";
import { ApplicationTypeIcon } from "../ui/ApplicationTypeIcon";
import { ExternalLink } from "../ui/ExternalLink";
import { StatusBadge } from "../ui/StatusBadge";

interface DetailSection {
  title: string;
  items: Array<{
    label: string;
    value: ReactNode;
  }>;
}

function createDetailSections(jobApplication: JobApplicationResponse): DetailSection[] {
  const applicationTypeLabel = getJobApplicationApplicationTypeLabel(jobApplication.application_type);

  return [
    {
      title: "Basic information",
      items: [
        { label: "Company", value: jobApplication.company_name },
        { label: "Job title", value: jobApplication.job_title },
        {
          label: "Status",
          value: (
            <StatusBadge
              label={jobApplication.status}
              tone={getJobApplicationStatusTone(jobApplication.status)}
            />
          ),
        },
        {
          label: "Archive state",
          value: (
            <StatusBadge
              label={jobApplication.is_archived ? "Archived" : "Active"}
              tone={jobApplication.is_archived ? "neutral" : "info"}
            />
          ),
        },
        { label: "Application date", value: formatDisplayDate(jobApplication.application_date) },
        {
          label: "Job link",
          value: <ExternalLink fallback="Not set" url={jobApplication.job_link} />,
        },
        { label: "Source", value: formatDisplayValue(jobApplication.source) },
        { label: "Location", value: formatDisplayValue(jobApplication.location) },
      ],
    },
    {
      title: "Descriptions and notes",
      items: [
        { label: "Short description", value: <MarkdownText collapsedHeight={180} markdown={jobApplication.short_description} /> },
        { label: "Full description", value: <MarkdownText collapsedHeight={260} markdown={jobApplication.full_description} /> },
        { label: "Required skills", value: <MarkdownText collapsedHeight={180} markdown={jobApplication.required_skills} /> },
        { label: "Notes", value: <MarkdownText collapsedHeight={180} markdown={jobApplication.notes} /> },
      ],
    },
    {
      title: "Process tracking",
      items: [
        { label: "Work mode", value: formatDisplayValue(jobApplication.work_mode) },
        {
          label: "Application type",
          value: applicationTypeLabel ? (
            <span className="details-application-type">
              <ApplicationTypeIcon
                applicationType={jobApplication.application_type}
                className="application-type-icon details-application-type__icon"
              />
              <span>{applicationTypeLabel}</span>
            </span>
          ) : (
            formatDisplayValue(applicationTypeLabel)
          ),
        },
        { label: "Priority", value: formatDisplayValue(jobApplication.priority) },
        { label: "Salary range", value: formatDisplayValue(jobApplication.salary_range) },
        { label: "Resume version", value: formatDisplayValue(jobApplication.resume_version) },
        { label: "Recruiter name", value: formatDisplayValue(jobApplication.recruiter_name) },
        { label: "Last follow-up date", value: formatDisplayDate(jobApplication.last_follow_up_date) },
        { label: "Next action date", value: formatDisplayDate(jobApplication.next_action_date) },
        { label: "Interview stage", value: formatDisplayValue(jobApplication.interview_stage) },
        { label: "Rejection reason", value: formatDisplayValue(jobApplication.rejection_reason) },
      ],
    },
  ];
}

export function JobApplicationDetailsSections({ jobApplication }: { jobApplication: JobApplicationResponse }) {
  const sections = createDetailSections(jobApplication);

  return (
    <>
      {sections.map((section) => (
        <section key={section.title} className="page-card">
          <div className="details-section__header">
            <div>
              <p className="page-card__eyebrow">Details</p>
              <h2>{section.title}</h2>
            </div>
          </div>

          <dl className="details-grid">
            {section.items.map((item) => (
              <div key={item.label} className="details-grid__item">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </>
  );
}
