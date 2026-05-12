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
    </div>
  );
}
