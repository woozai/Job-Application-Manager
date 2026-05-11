interface JobApplicationPriorityTagProps {
  priority: string | null;
}

function getPriorityTone(priority: string | null) {
  switch (priority?.trim().toLowerCase()) {
    case "high":
      return "high";
    case "medium":
      return "medium";
    case "low":
      return "low";
    default:
      return null;
  }
}

function formatPriorityLabel(priority: string | null) {
  if (!priority) {
    return null;
  }

  return `${priority.trim().charAt(0).toUpperCase()}${priority.trim().slice(1).toLowerCase()}`;
}

export function JobApplicationPriorityTag({
  priority,
}: JobApplicationPriorityTagProps) {
  const priorityTone = getPriorityTone(priority);
  const priorityLabel = formatPriorityLabel(priority);

  if (!priorityTone || !priorityLabel) {
    return null;
  }

  return (
    <span
      aria-label={`${priorityLabel} priority`}
      className={`dashboard-priority-tag dashboard-priority-tag--${priorityTone}`}
      title={`${priorityLabel} priority`}
    >
      <svg
        aria-hidden="true"
        className="dashboard-priority-tag__icon"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M6 20V4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M6 5h9.3c.72 0 1.1.84.63 1.41L14.7 8l1.23 1.59c.47.57.09 1.41-.63 1.41H6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      <span>{priorityLabel}</span>
    </span>
  );
}
