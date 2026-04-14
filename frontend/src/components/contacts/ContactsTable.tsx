import { Link } from "react-router-dom";

import type { ContactResponse } from "../../types/contact";
import { getContactResponseStatusTone } from "../../utils/contactResponseStatusTone";
import { StatusBadge } from "../ui/StatusBadge";

function formatValue(value: string | null | undefined, fallback = "Not set") {
  if (!value || value.trim().length === 0) {
    return fallback;
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

function getBooleanLabel(value: boolean, positiveLabel: string, negativeLabel: string) {
  return value ? positiveLabel : negativeLabel;
}

function BooleanIcon({
  value,
  positiveLabel,
  negativeLabel,
}: {
  value: boolean;
  positiveLabel: string;
  negativeLabel: string;
}) {
  return (
    <span
      aria-label={getBooleanLabel(value, positiveLabel, negativeLabel)}
      className={`contacts-check ${value ? "contacts-check--checked" : "contacts-check--empty"}`}
      role="img"
    >
      {value ? "✓" : "−"}
    </span>
  );
}

function EmptyValueIcon({ label }: { label: string }) {
  return (
    <span
      aria-label={label}
      className="contacts-check contacts-check--empty"
      role="img"
    >
      −
    </span>
  );
}

interface ContactsTableProps {
  contacts: ContactResponse[];
  deletingContactId?: number | null;
  onDelete: (contact: ContactResponse) => void;
  onEdit: (contact: ContactResponse) => void;
}

export function ContactsTable({
  contacts,
  deletingContactId = null,
  onDelete,
  onEdit,
}: ContactsTableProps) {
  if (contacts.length === 0) {
    return (
      <section className="page-card contacts-empty-state">
        <p className="page-card__eyebrow">Contacts</p>
        <h2>Related contacts</h2>
        <p className="page-card__body">
          Keep your outreach organized by adding recruiters, referrals, and other connections to this
          application.
        </p>
        <div className="contacts-empty-state__panel">
          <strong>No contacts yet</strong>
          <p>
            Once you add people to this application, their relationship, response status, messages, and
            notes will appear here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-card">
      <p className="page-card__eyebrow">Contacts</p>
      <div className="details-section__header">
        <div>
          <h2>Related contacts</h2>
          <p className="page-card__body">
            Track networking progress, outreach, and context for everyone tied to this job.
          </p>
        </div>
        <p className="details-section__meta">{contacts.length} linked to this application</p>
      </div>

      <div className="contacts-table-wrapper">
        <table className="contacts-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Relationship</th>
              <th>Response status</th>
              <th>Approved</th>
              <th>Message sent</th>
              <th>Notes</th>
              <th>Last activity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => {
              const jobTitle = contact.job_title?.trim() ?? "";

              return (
                <tr key={contact.id}>
                  <td>
                    <div className="contacts-table__identity">
                      <strong>
                        <Link className="contacts-table__link" to={`/contacts/${contact.id}`}>
                          {contact.name}
                        </Link>
                      </strong>
                      {jobTitle ? (
                        <span className="contacts-table__job-title" title={jobTitle}>
                          {jobTitle}
                        </span>
                      ) : (
                        <span>{formatValue(null, "Role not set")}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="contacts-table__stack">
                      <span>{formatValue(contact.relationship_type)}</span>
                      <span className="contacts-table__subtle">
                        {formatValue(contact.priority, "Priority not set")}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="contacts-table__stack">
                      <StatusBadge
                        label={contact.response_status}
                        tone={getContactResponseStatusTone(contact.response_status)}
                      />
                    </div>
                  </td>
                  <td>
                    <BooleanIcon
                      negativeLabel="Not approved"
                      positiveLabel="Approved"
                      value={contact.connection_approved}
                    />
                  </td>
                  <td>
                    <div className="contacts-table__stack">
                      <BooleanIcon
                        negativeLabel="Message not sent"
                        positiveLabel="Message sent"
                        value={contact.message_sent}
                      />
                      <span className="contacts-table__subtle">
                        {contact.message_sent_at ? `On ${formatDateValue(contact.message_sent_at)}` : ""}
                      </span>
                    </div>
                  </td>
                  <td className="contacts-table__notes">
                    {contact.notes?.trim().length ? contact.notes : <EmptyValueIcon label="No notes" />}
                  </td>
                  <td>
                    <div className="contacts-table__stack">
                      <span>{contact.last_interaction_date ? formatDateValue(contact.last_interaction_date) : ""}</span>
                      {contact.connection_requested_at ? (
                        <span className="contacts-table__subtle">
                          Requested {formatDateValue(contact.connection_requested_at)}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className="contacts-table__actions">
                      <button
                        aria-label={`Edit ${contact.name}`}
                        className="contacts-table__action-button contacts-table__action-button--edit"
                        onClick={() => onEdit(contact)}
                        title="Edit contact"
                        type="button"
                      >
                        <span aria-hidden="true">✎</span>
                      </button>
                      <button
                        aria-label={`Delete ${contact.name}`}
                        className="contacts-table__action-button contacts-table__action-button--delete"
                        disabled={deletingContactId === contact.id}
                        onClick={() => onDelete(contact)}
                        title="Delete contact"
                        type="button"
                      >
                        <span aria-hidden="true">{deletingContactId === contact.id ? "…" : "🗑"}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
