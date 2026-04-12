import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getContact } from "../api/contacts";
import { ApiError } from "../api/client";
import { ContactDetailsSections } from "../components/contacts/ContactDetailsSections";
import { ErrorState } from "../components/ui/ErrorState";
import { ExternalLink } from "../components/ui/ExternalLink";
import { LoadingState } from "../components/ui/LoadingState";
import { useAuth } from "../hooks/useAuth";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { ContactResponse } from "../types/contact";
import { formatDisplayValue, getSafeExternalUrl } from "../utils/display";

export function ContactDetailsPage() {
  const { contactId } = useParams();
  const { token } = useAuth();
  const [contact, setContact] = useState<ContactResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useDocumentTitle("Contact Details | Job Application Manager");

  async function loadContactDetails() {
    const parsedContactId = Number(contactId);

    if (!token || !Number.isInteger(parsedContactId) || parsedContactId <= 0) {
      setContact(null);
      setLoadError("Contact not found.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const loadedContact = await getContact(parsedContactId, token);
      setContact(loadedContact);
    } catch (error) {
      if (error instanceof ApiError) {
        setLoadError(error.message);
      } else {
        setLoadError("We could not load this contact.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadContactDetails();
  }, [contactId, token]);

  if (isLoading) {
    return (
      <LoadingState
        title="Loading contact details"
        message="Fetching the full contact record and outreach history."
      />
    );
  }

  if (loadError || !contact) {
    return (
      <ErrorState
        title="Could not load contact"
        message={loadError ?? "Contact not found."}
        action={
          <button className="button-link" onClick={() => void loadContactDetails()} type="button">
            Try again
          </button>
        }
      />
    );
  }

  return (
    <div className="page-stack">
      <section className="page-card">
        <p className="page-card__eyebrow">Contact profile</p>
        <div className="details-hero">
          <div className="details-hero__content">
            <p className="dashboard-job-card__company">
              {formatDisplayValue(contact.relationship_type, "Contact")}
            </p>
            <h2>{contact.name}</h2>
            <p className="page-card__body">
              Review this contact's role, profile link, outreach status, dates, and notes.
            </p>
          </div>

          <div className="details-hero__actions">
            {getSafeExternalUrl(contact.profile_link) ? (
              <ExternalLink
                className="button-link button-link--primary"
                label="Open profile"
                url={contact.profile_link}
              />
            ) : null}
            <Link className="button-link details-secondary-button" to={`/job-applications/${contact.job_application_id}`}>
              Back to job
            </Link>
          </div>
        </div>
      </section>

      <ContactDetailsSections contact={contact} />

      <section className="page-card">
        <div className="job-form__actions">
          <Link className="button-link button-link--primary" to={`/job-applications/${contact.job_application_id}`}>
            Back to job details
          </Link>
          <Link className="button-link details-secondary-button" to="/dashboard">
            Back to dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
