import { formatDisplayDate, formatDisplayValue } from "../../utils/display";
import type { JobApplicationResponse } from "../../types/jobApplication";

export function JobApplicationArchiveNotice({
  jobApplication,
}: {
  jobApplication: JobApplicationResponse;
}) {
  if (!jobApplication.is_archived) {
    return null;
  }

  return (
    <div className="details-hero__archive">
      <p className="page-card__eyebrow">Archived</p>
      <p className="page-card__body">
        This job is archived and hidden from the active dashboard.
      </p>
      <dl className="details-archive-meta">
        <div>
          <dt>Archived at</dt>
          <dd>{formatDisplayDate(jobApplication.archived_at)}</dd>
        </div>
        <div>
          <dt>Archive reason</dt>
          <dd>{formatDisplayValue(jobApplication.archive_reason)}</dd>
        </div>
      </dl>
    </div>
  );
}
