import type { ReactNode } from "react";

import type { ContactResponse } from "../../types/contact";
import { formatDisplayDate, formatDisplayValue } from "../../utils/display";
import { ExpandableText } from "../ui/ExpandableText";
import { ExternalLink } from "../ui/ExternalLink";

interface ContactDetailSection {
  title: string;
  items: Array<{
    label: string;
    value: ReactNode;
  }>;
}

function formatBoolean(value: boolean, trueLabel: string, falseLabel: string) {
  return value ? trueLabel : falseLabel;
}

function createContactDetailSections(contact: ContactResponse): ContactDetailSection[] {
  return [
    {
      title: "Contact information",
      items: [
        { label: "Name", value: contact.name },
        { label: "Relationship", value: formatDisplayValue(contact.relationship_type) },
        { label: "Priority", value: formatDisplayValue(contact.priority) },
        { label: "Company", value: formatDisplayValue(contact.company) },
        { label: "Job title", value: formatDisplayValue(contact.job_title) },
        {
          label: "Profile link",
          value: <ExternalLink fallback="Not set" url={contact.profile_link} />,
        },
      ],
    },
    {
      title: "Outreach tracking",
      items: [
        { label: "Connection requested", value: formatDisplayDate(contact.connection_requested_at) },
        {
          label: "Connection approved",
          value: formatBoolean(contact.connection_approved, "Approved", "Not approved"),
        },
        { label: "Approval date", value: formatDisplayDate(contact.connection_approved_at) },
        { label: "Message sent", value: formatBoolean(contact.message_sent, "Message sent", "Not sent") },
        { label: "Message date", value: formatDisplayDate(contact.message_sent_at) },
        { label: "Response status", value: formatDisplayValue(contact.response_status) },
        { label: "Last activity", value: formatDisplayDate(contact.last_interaction_date) },
      ],
    },
    {
      title: "Notes and history",
      items: [
        { label: "Notes", value: <ExpandableText maxLength={220} text={contact.notes} /> },
        { label: "Created", value: formatDisplayDate(contact.created_at) },
        { label: "Last updated", value: formatDisplayDate(contact.updated_at) },
      ],
    },
  ];
}

export function ContactDetailsSections({ contact }: { contact: ContactResponse }) {
  const sections = createContactDetailSections(contact);

  return (
    <>
      {sections.map((section) => (
        <section key={section.title} className="page-card">
          <div className="details-section__header">
            <div>
              <p className="page-card__eyebrow">Contact details</p>
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
