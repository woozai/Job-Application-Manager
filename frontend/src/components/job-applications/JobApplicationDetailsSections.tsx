import type { ReactNode } from "react";

import { ExpandableText } from "../ui/ExpandableText";
import type { JobApplicationResponse } from "../../types/jobApplication";
import { formatDisplayDate, formatDisplayValue } from "../../utils/display";
import { getJobApplicationStatusTone } from "../../utils/jobApplicationStatusTone";
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
        { label: "Application date", value: formatDisplayDate(jobApplication.application_date) },
        {
          label: "Job link",
          value: <ExternalLink fallback="Not set" url={jobApplication.job_link} />,
        },
        {
          label: "Source link",
          value: <ExternalLink fallback="Not set" url={jobApplication.source_link} />,
        },
        { label: "Source", value: formatDisplayValue(jobApplication.source) },
        { label: "Location", value: formatDisplayValue(jobApplication.location) },
      ],
    },
    {
      title: "Descriptions and notes",
      items: [
        { label: "Short description", value: <ExpandableText maxLength={180} text={jobApplication.short_description} /> },
        { label: "Full description", value: <ExpandableText maxLength={220} text={jobApplication.full_description} /> },
        { label: "Required skills", value: <ExpandableText maxLength={180} text={jobApplication.required_skills} /> },
        { label: "Notes", value: <ExpandableText maxLength={180} text={jobApplication.notes} /> },
        { label: "Tags", value: formatDisplayValue(jobApplication.tags) },
      ],
    },
    {
      title: "Process tracking",
      items: [
        { label: "Work mode", value: formatDisplayValue(jobApplication.work_mode) },
        { label: "Application type", value: formatDisplayValue(jobApplication.application_type) },
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
