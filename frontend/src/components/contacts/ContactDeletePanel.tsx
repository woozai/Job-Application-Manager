import type { ContactResponse } from "../../types/contact";

interface ContactDeletePanelProps {
  contactPendingDelete: ContactResponse;
  deleteError: string | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ContactDeletePanel({
  contactPendingDelete,
  deleteError,
  isDeleting,
  onCancel,
  onConfirm,
}: ContactDeletePanelProps) {
  return (
    <section className="feedback-panel feedback-panel--error" role="alert">
      <div className="feedback-panel__header">
        <div>
          <p className="feedback-panel__eyebrow">Delete action</p>
          <h3>Delete {contactPendingDelete.name}?</h3>
        </div>
        <button className="button-link" disabled={isDeleting} onClick={onCancel} type="button">
          Close
        </button>
      </div>
      <p>
        This will remove this contact and their outreach history from the application. This action cannot be
        undone.
      </p>
      {deleteError ? <p className="form-error">{deleteError}</p> : null}
      <div className="feedback-panel__action">
        <button className="button-link button-link--danger" disabled={isDeleting} onClick={onConfirm} type="button">
          {isDeleting ? "Deleting..." : "Confirm delete"}
        </button>
        <button className="button-link" disabled={isDeleting} onClick={onCancel} type="button">
          Cancel
        </button>
      </div>
    </section>
  );
}
