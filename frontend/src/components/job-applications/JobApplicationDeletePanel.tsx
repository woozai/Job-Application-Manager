interface JobApplicationDeletePanelProps {
  companyName: string;
  deleteError: string | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function JobApplicationDeletePanel({
  companyName,
  deleteError,
  isDeleting,
  onCancel,
  onConfirm,
}: JobApplicationDeletePanelProps) {
  return (
    <section className="feedback-panel feedback-panel--error" role="alert">
      <div className="feedback-panel__header">
        <div>
          <p className="feedback-panel__eyebrow">Delete action</p>
          <h3>Delete this application?</h3>
        </div>
        <button className="button-link" disabled={isDeleting} onClick={onCancel} type="button">
          Close
        </button>
      </div>
      <p>
        This will permanently remove <strong>{companyName}</strong> from your tracker. This action cannot be
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
