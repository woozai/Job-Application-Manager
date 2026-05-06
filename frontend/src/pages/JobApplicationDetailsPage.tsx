import { Link, useLocation } from "react-router-dom";

import { ContactDeletePanel } from "../components/contacts/ContactDeletePanel";
import { ContactForm } from "../components/contacts/ContactForm";
import { ContactsTable } from "../components/contacts/ContactsTable";
import { JobApplicationDeletePanel } from "../components/job-applications/JobApplicationDeletePanel";
import { JobApplicationDetailsSections } from "../components/job-applications/JobApplicationDetailsSections";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { useAuth } from "../hooks/useAuth";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useJobApplicationDetails } from "../hooks/useJobApplicationDetails";

export function JobApplicationDetailsPage() {
  const location = useLocation();
  const { token } = useAuth();
  const routeState = location.state as { successMessage?: string } | null;
  useDocumentTitle("Job Details | Job Application Manager");
  const {
    jobApplicationId,
    jobApplication,
    isLoading,
    loadError,
    loadJobDetails,
    showDeleteConfirm,
    setShowDeleteConfirm,
    deleteError,
    setDeleteError,
    isDeleting,
    handleDelete,
    isCreatingContact,
    createContactError,
    setCreateContactError,
    createContactSuccessMessage,
    setCreateContactSuccessMessage,
    showCreateContactForm,
    setShowCreateContactForm,
    handleCreateContact,
    editingContact,
    setEditingContact,
    isSavingEditedContact,
    editContactError,
    setEditContactError,
    handleEditContact,
    contactPendingDelete,
    setContactPendingDelete,
    deleteContactError,
    setDeleteContactError,
    isDeletingContact,
    handleDeleteContact,
  } = useJobApplicationDetails(token);

  if (isLoading) {
    return (
      <LoadingState
        title="Loading application details"
        message="Pulling together the full job record and related contacts."
      />
    );
  }

  if (loadError || !jobApplication) {
    return (
      <ErrorState
        title="Could not load application"
        message={loadError ?? "Application not found."}
        action={
          <button className="button-link" onClick={() => void loadJobDetails()} type="button">
            Try again
          </button>
        }
      />
    );
  }

  const currentJobApplication = jobApplication;

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
            {currentJobApplication.is_archived ? (
              <div className="details-hero__archive">
                <p className="page-card__eyebrow">Archived</p>
                <p className="page-card__body">
                  This job is archived and hidden from the active dashboard.
                  {currentJobApplication.archived_at ? ` Archived on ${new Date(currentJobApplication.archived_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}.` : ""}
                </p>
              </div>
            ) : null}
          </div>

          <div className="details-hero__actions">
            <Link className="button-link button-link--primary" to={`/job-applications/${jobApplicationId}/edit`}>
              Edit application
            </Link>
            <button
              className="button-link button-link--danger"
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
        <JobApplicationDeletePanel
          companyName={currentJobApplication.company_name}
          deleteError={deleteError}
          isDeleting={isDeleting}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
        />
      ) : null}

      <JobApplicationDetailsSections jobApplication={currentJobApplication} />

      {editingContact ? (
        <ContactForm
          contact={editingContact}
          isSubmitting={isSavingEditedContact}
          jobApplicationId={currentJobApplication.id}
          onCancel={() => {
            setEditingContact(null);
            setEditContactError(null);
          }}
          onSubmit={handleEditContact}
          submitError={editContactError}
          successMessage={null}
        />
      ) : showCreateContactForm ? (
        <ContactForm
          defaultCompanyName={currentJobApplication.company_name}
          isSubmitting={isCreatingContact}
          jobApplicationId={currentJobApplication.id}
          onCancel={() => {
            setShowCreateContactForm(false);
            setCreateContactError(null);
            setCreateContactSuccessMessage(null);
          }}
          onSubmit={handleCreateContact}
          submitError={createContactError}
          successMessage={null}
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
          {createContactSuccessMessage ? (
            <section className="feedback-panel feedback-panel--success" role="status">
              <p className="feedback-panel__eyebrow">Success</p>
              <h3>Contact saved</h3>
              <p>{createContactSuccessMessage}</p>
            </section>
          ) : null}
        </section>
      )}

      {contactPendingDelete ? (
        <ContactDeletePanel
          contactPendingDelete={contactPendingDelete}
          deleteError={deleteContactError}
          isDeleting={isDeletingContact}
          onCancel={() => {
            setContactPendingDelete(null);
            setDeleteContactError(null);
          }}
          onConfirm={handleDeleteContact}
        />
      ) : null}

      <ContactsTable
        contacts={currentJobApplication.contacts}
        deletingContactId={isDeletingContact ? contactPendingDelete?.id ?? null : null}
        onDelete={(contact) => {
          setContactPendingDelete(contact);
          setDeleteContactError(null);
        }}
        onEdit={(contact) => {
          setEditingContact(contact);
          setShowCreateContactForm(false);
          setCreateContactError(null);
          setCreateContactSuccessMessage(null);
          setEditContactError(null);
          setContactPendingDelete(null);
          setDeleteContactError(null);
        }}
      />

      <section className="page-card">
        <div className="job-form__actions">
          <Link className="button-link button-link--primary" to={`/job-applications/${jobApplicationId}/edit`}>
            Edit application
          </Link>
          <Link className="button-link details-secondary-button" to="/dashboard">
            Back to dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
