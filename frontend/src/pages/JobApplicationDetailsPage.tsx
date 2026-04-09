import { Link, useParams } from "react-router-dom";

import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function JobApplicationDetailsPage() {
  const { jobApplicationId } = useParams();

  useDocumentTitle("Job Details | Job Application Manager");

  return (
    <section className="page-card">
      <p className="page-card__eyebrow">Job details</p>
      <h2>Application {jobApplicationId}</h2>
      <p className="page-card__body">
        The details page route is now wired from the reusable job cards. We can build the full
        details experience in the next dedicated task.
      </p>
      <Link className="button-link" to="/dashboard">
        Back to dashboard
      </Link>
    </section>
  );
}
