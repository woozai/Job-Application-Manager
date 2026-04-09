import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function DashboardPage() {
  useDocumentTitle("Dashboard | Job Application Manager");

  return (
    <div className="page-stack">
      <section className="page-card">
        <p className="page-card__eyebrow">Task 2 shell</p>
        <h2>Dashboard home</h2>
        <p className="page-card__body">
          The main app layout and top-level navigation are now in place. The shared feedback
          states below are ready to reuse when we connect real data.
        </p>
      </section>

      <div className="feedback-grid">
        <LoadingState
          title="Loading job applications"
          message="Fetching your latest opportunities and updating the dashboard."
        />
        <ErrorState
          title="Could not load applications"
          message="Use this shared pattern when a dashboard request fails or returns an invalid response."
        />
      </div>
    </div>
  );
}
