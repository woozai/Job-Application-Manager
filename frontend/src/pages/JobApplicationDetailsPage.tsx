import { Link, useLocation, useParams } from "react-router-dom";

import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function JobApplicationDetailsPage() {
  const { jobApplicationId } = useParams();
  const location = useLocation();
  const routeState = location.state as { successMessage?: string } | null;

  useDocumentTitle("Job Details | Job Application Manager");

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
        <h2>Application {jobApplicationId}</h2>
        <p className="page-card__body">
          The details page route is wired and can now receive users after create and edit flows.
          We can build the full details experience in the next dedicated task.
        </p>
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
