import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { createContact } from "../api/contacts";
import { deleteJobApplication, getJobApplication } from "../api/jobApplications";
import { ContactForm } from "../components/contacts/ContactForm";
import { ContactsTable } from "../components/contacts/ContactsTable";
import { ApiError } from "../api/client";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { useAuth } from "../hooks/useAuth";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { ContactCreateInput } from "../types/contact";

type DetailItemValue = ReactNode;

interface DetailSection {
  title: string;
  items: Array<{
    label: string;
    value: DetailItemValue;
  }>;
}

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
  const [isCreatingContact, setIsCreatingContact] = useState(false);
  const [createContactError, setCreateContactError] = useState<string | null>(null);
  const [createContactSuccessMessage, setCreateContactSuccessMessage] = useState<string | null>(null);
  const [showCreateContactForm, setShowCreateContactForm] = useState(false);

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
          { label: "Company", value: jobApplication.company_name },
          { label: "Job title", value: jobApplication.job_title },
          { label: "Status", value: formatValue(jobApplication.status) },
          { label: "Application date", value: formatDateValue(jobApplication.application_date) },
          {
            label: "Job link",
            value: jobApplication.job_link ? (
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
          },
          {
            label: "Source link",
            value: jobApplication.source_link ? (
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
          },
          { label: "Source", value: formatValue(jobApplication.source) },
          { label: "Location", value: formatValue(jobApplication.location) },
        ],
      },
      {
        title: "Descriptions and notes",
        items: [
          {
            label: "Short description",
            value: <ExpandableText maxLength={180} text={jobApplication.short_description} />,
          },
          {
            label: "Full description",
            value: <ExpandableText maxLength={220} text={jobApplication.full_description} />,
          },
          {
            label: "Required skills",
            value: <ExpandableText maxLength={180} text={jobApplication.required_skills} />,
          },
          { label: "Notes", value: <ExpandableText maxLength={180} text={jobApplication.notes} /> },
          { label: "Tags", value: formatValue(jobApplication.tags) },
        ],
      },
      {
        title: "Process tracking",
        items: [
          { label: "Work mode", value: formatValue(jobApplication.work_mode) },
          { label: "Application type", value: formatValue(jobApplication.application_type) },
          { label: "Priority", value: formatValue(jobApplication.priority) },
          { label: "Salary range", value: formatValue(jobApplication.salary_range) },
          { label: "Resume version", value: formatValue(jobApplication.resume_version) },
          { label: "Recruiter name", value: formatValue(jobApplication.recruiter_name) },
          { label: "Last follow-up date", value: formatDateValue(jobApplication.last_follow_up_date) },
          { label: "Next action date", value: formatDateValue(jobApplication.next_action_date) },
          { label: "Interview stage", value: formatValue(jobApplication.interview_stage) },
          { label: "Rejection reason", value: formatValue(jobApplication.rejection_reason) },
        ],
      },
    ] satisfies DetailSection[];
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

  const currentJobApplication = jobApplication;

  async function handleDelete() {
    if (!token || !jobApplicationId) {
      setDeleteError("We could not determine which application to delete.");
      return;
    }

    const companyName = currentJobApplication.company_name;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteJobApplication(Number(jobApplicationId), token);
      navigate("/dashboard", {
        replace: true,
        state: {
          successMessage: `${companyName} was deleted successfully.`,
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

  async function handleCreateContact(payload: ContactCreateInput) {
    if (!token) {
      setCreateContactError("You must be signed in to add a contact.");
      return false;
    }

    setIsCreatingContact(true);
    setCreateContactError(null);
    setCreateContactSuccessMessage(null);

    try {
      const createdContact = await createContact(payload, token);

      setJobApplication((currentJobApplication) => {
        if (!currentJobApplication) {
          return currentJobApplication;
        }

        return {
          ...currentJobApplication,
          contacts: [...currentJobApplication.contacts, createdContact],
        };
      });

      setCreateContactSuccessMessage(`${createdContact.name} was added to this application.`);
      setShowCreateContactForm(false);
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        setCreateContactError(error.message);
      } else {
        setCreateContactError("We could not create this contact. Please try again.");
      }
      return false;
    } finally {
      setIsCreatingContact(false);
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
            <p className="dashboard-job-card__company">{currentJobApplication.company_name}</p>
            <h2>{currentJobApplication.job_title}</h2>
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
            This will permanently remove <strong>{currentJobApplication.company_name}</strong> from your tracker.
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
            {section.items.map((item) => (
              <div key={item.label} className="details-grid__item">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      {showCreateContactForm ? (
        <ContactForm
          isSubmitting={isCreatingContact}
          jobApplicationId={currentJobApplication.id}
          onCancel={() => {
            setShowCreateContactForm(false);
            setCreateContactError(null);
            setCreateContactSuccessMessage(null);
          }}
          onSubmit={handleCreateContact}
          submitError={createContactError}
          successMessage={createContactSuccessMessage}
        />
      ) : (
        <section className="page-card">
          <p className="page-card__eyebrow">Contacts</p>
          <div className="details-section__header">
            <div>
              <h2>Add a contact</h2>
              <p className="page-card__body">
                Open the contact form when you want to add a recruiter, referral, or another connection.
              </p>
            </div>
            <button
              className="button-link button-link--primary"
              onClick={() => {
                setShowCreateContactForm(true);
                setCreateContactError(null);
                setCreateContactSuccessMessage(null);
              }}
              type="button"
            >
              Add contact
            </button>
          </div>
        </section>
      )}

      <ContactsTable contacts={currentJobApplication.contacts} />

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
