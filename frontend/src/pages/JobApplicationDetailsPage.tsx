import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { deleteJobApplication, getJobApplication } from "../api/jobApplications";
import { ApiError } from "../api/client";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { useAuth } from "../hooks/useAuth";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { ContactResponse } from "../types/contact";

function formatValue(value: string | null | undefined) {
  if (!value || value.trim().length === 0) {
    return "Not set";
  }

  return value;
}

function formatDateValue(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatBooleanValue(value: boolean) {
  return value ? "Yes" : "No";
}

function ExpandableText({
  text,
  maxLength = 180,
}: {
  text: string | null | undefined;
  maxLength?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const normalizedText = text?.trim() ?? "";

  if (normalizedText.length === 0) {
    return <>Not set</>;
  }

  if (normalizedText.length <= maxLength) {
    return <span>{normalizedText}</span>;
  }

  const shortText = `${normalizedText.slice(0, maxLength).trimEnd()}...`;

  return (
    <div className="expandable-text">
      <p className="expandable-text__content">{isExpanded ? normalizedText : shortText}</p>
      <button
        className="expandable-text__button"
        onClick={() => setIsExpanded((current) => !current)}
        type="button"
      >
        {isExpanded ? "Show less" : "Show full text"}
      </button>
    </div>
  );
}

function getExternalLinkLabel(value: string | null | undefined, fallbackLabel: string) {
  if (!value || value.trim().length === 0) {
    return "Not set";
  }

  try {
    const url = new URL(value);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return fallbackLabel;
  }
}

function ContactTable({ contacts }: { contacts: ContactResponse[] }) {
  if (contacts.length === 0) {
    return (
      <section className="page-card">
        <p className="page-card__eyebrow">Contacts</p>
        <h2>Related contacts</h2>
        <p className="page-card__body">
          No contacts have been added to this application yet.
        </p>
      </section>
    );
  }

  return (
    <section className="page-card">
      <p className="page-card__eyebrow">Contacts</p>
      <div className="details-section__header">
        <h2>Related contacts</h2>
        <p className="details-section__meta">{contacts.length} linked to this application</p>
      </div>

      <div className="contacts-table-wrapper">
        <table className="contacts-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Relationship</th>
              <th>Role</th>
              <th>Company</th>
              <th>Response</th>
              <th>Message sent</th>
              <th>Connection approved</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.name}</td>
                <td>{formatValue(contact.relationship_type)}</td>
                <td>{formatValue(contact.job_title)}</td>
                <td>{formatValue(contact.company)}</td>
                <td>{formatValue(contact.response_status)}</td>
                <td>{formatBooleanValue(contact.message_sent)}</td>
                <td>{formatBooleanValue(contact.connection_approved)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function JobApplicationDetailsPage() {
  const { jobApplicationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const routeState = location.state as { successMessage?: string } | null;
  const [jobApplication, setJobApplication] = useState<Awaited<ReturnType<typeof getJobApplication>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useDocumentTitle("Job Details | Job Application Manager");

  useEffect(() => {
    async function loadJobDetails() {
      if (!token || !jobApplicationId) {
        setLoadError("We could not determine which application to load.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const application = await getJobApplication(Number(jobApplicationId), token);
        setJobApplication(application);
      } catch (error) {
        if (error instanceof ApiError) {
          setLoadError(error.message);
        } else {
          setLoadError("We could not load this job application.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadJobDetails();
  }, [jobApplicationId, token]);

  const detailSections = useMemo(() => {
    if (!jobApplication) {
      return [];
    }

    return [
      {
        title: "Basic information",
        items: [
          ["Company", jobApplication.company_name],
          ["Job title", jobApplication.job_title],
          ["Status", formatValue(jobApplication.status)],
          ["Application date", formatDateValue(jobApplication.application_date)],
          [
            "Job link",
            jobApplication.job_link ? (
              <a
                className="details-link"
                href={jobApplication.job_link}
                rel="noreferrer"
                target="_blank"
                title={jobApplication.job_link}
              >
                {getExternalLinkLabel(jobApplication.job_link, "Open job link")}
              </a>
            ) : (
              "Not set"
            ),
          ],
          [
            "Source link",
            jobApplication.source_link ? (
              <a
                className="details-link"
                href={jobApplication.source_link}
                rel="noreferrer"
                target="_blank"
                title={jobApplication.source_link}
              >
                {getExternalLinkLabel(jobApplication.source_link, "Open source link")}
              </a>
            ) : (
              "Not set"
            ),
          ],
          ["Source", formatValue(jobApplication.source)],
          ["Location", formatValue(jobApplication.location)],
        ],
      },
      {
        title: "Descriptions and notes",
        items: [
          ["Short description", <ExpandableText maxLength={180} text={jobApplication.short_description} />],
          ["Full description", <ExpandableText maxLength={220} text={jobApplication.full_description} />],
          ["Required skills", <ExpandableText maxLength={180} text={jobApplication.required_skills} />],
          ["Notes", <ExpandableText maxLength={180} text={jobApplication.notes} />],
          ["Tags", formatValue(jobApplication.tags)],
        ],
      },
      {
        title: "Process tracking",
        items: [
          ["Work mode", formatValue(jobApplication.work_mode)],
          ["Application type", formatValue(jobApplication.application_type)],
          ["Priority", formatValue(jobApplication.priority)],
          ["Salary range", formatValue(jobApplication.salary_range)],
          ["Resume version", formatValue(jobApplication.resume_version)],
          ["Recruiter name", formatValue(jobApplication.recruiter_name)],
          ["Last follow-up date", formatDateValue(jobApplication.last_follow_up_date)],
          ["Next action date", formatDateValue(jobApplication.next_action_date)],
          ["Interview stage", formatValue(jobApplication.interview_stage)],
          ["Rejection reason", formatValue(jobApplication.rejection_reason)],
        ],
      },
    ];
  }, [jobApplication]);

  if (isLoading) {
    return (
      <LoadingState
        title="Loading application details"
        message="Pulling together the full job record and related contacts."
      />
    );
  }

  if (loadError || !jobApplication) {
    return <ErrorState title="Could not load application" message={loadError ?? "Application not found."} />;
  }

  async function handleDelete() {
    if (!token || !jobApplicationId) {
      setDeleteError("We could not determine which application to delete.");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteJobApplication(Number(jobApplicationId), token);
      navigate("/dashboard", {
        replace: true,
        state: {
          successMessage: `${jobApplication.company_name} was deleted successfully.`,
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setDeleteError(error.message);
      } else {
        setDeleteError("We could not delete this job application. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="page-stack">
      {routeState?.successMessage ? (
        <section className="feedback-panel feedback-panel--success" role="status">
          <p className="feedback-panel__eyebrow">Success</p>
          <h3>Application saved</h3>
          <p>{routeState.successMessage}</p>
        </section>
      ) : null}

      <section className="page-card">
        <p className="page-card__eyebrow">Job details</p>
        <div className="details-hero">
          <div className="details-hero__content">
            <p className="dashboard-job-card__company">{jobApplication.company_name}</p>
            <h2>{jobApplication.job_title}</h2>
            <p className="page-card__body">
              Review the full job record, process details, and related networking contacts in one place.
            </p>
          </div>

          <div className="details-hero__actions">
            <Link className="button-link button-link--primary" to={`/job-applications/${jobApplicationId}/edit`}>
              Edit application
            </Link>
            <button
              className="button-link"
              onClick={() => {
                setShowDeleteConfirm((current) => !current);
                setDeleteError(null);
              }}
              type="button"
            >
              {showDeleteConfirm ? "Close delete action" : "Delete application"}
            </button>
          </div>
        </div>
      </section>

      {showDeleteConfirm ? (
        <section className="feedback-panel feedback-panel--error" role="alert">
          <div className="feedback-panel__header">
            <div>
              <p className="feedback-panel__eyebrow">Delete action</p>
              <h3>Delete this application?</h3>
            </div>
            <button
              className="button-link"
              disabled={isDeleting}
              onClick={() => setShowDeleteConfirm(false)}
              type="button"
            >
              Close
            </button>
          </div>
          <p>
            This will permanently remove <strong>{jobApplication.company_name}</strong> from your tracker.
            This action cannot be undone.
          </p>
          {deleteError ? <p className="form-error">{deleteError}</p> : null}
          <div className="feedback-panel__action">
            <button
              className="button-link button-link--danger"
              disabled={isDeleting}
              onClick={handleDelete}
              type="button"
            >
              {isDeleting ? "Deleting..." : "Confirm delete"}
            </button>
            <button
              className="button-link"
              disabled={isDeleting}
              onClick={() => setShowDeleteConfirm(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </section>
      ) : null}

      {detailSections.map((section) => (
        <section key={section.title} className="page-card">
          <div className="details-section__header">
            <div>
              <p className="page-card__eyebrow">Details</p>
              <h2>{section.title}</h2>
            </div>
          </div>

          <dl className="details-grid">
            {section.items.map(([label, value]) => (
              <div key={label} className="details-grid__item">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <ContactTable contacts={jobApplication.contacts} />

      <section className="page-card">
        <div className="job-form__actions">
          <Link className="button-link button-link--primary" to={`/job-applications/${jobApplicationId}/edit`}>
            Edit application
          </Link>
          <Link className="button-link" to="/dashboard">
            Back to dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
