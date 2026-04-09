import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { useAuth } from "../hooks/useAuth";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function DashboardPage() {
  useDocumentTitle("Dashboard | Job Application Manager");
  const { currentUser } = useAuth();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const routeState = location.state as { successMessage?: string } | null;

    if (routeState?.successMessage) {
      setSuccessMessage(routeState.successMessage);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.pathname, location.state]);

  return (
    <div className="page-stack">
      {successMessage ? (
        <section className="feedback-panel feedback-panel--success" role="status">
          <p className="feedback-panel__eyebrow">Success</p>
          <h3>Welcome back</h3>
          <p>{successMessage}</p>
        </section>
      ) : null}

      <section className="page-card">
        <p className="page-card__eyebrow">Task 2 shell</p>
        <h2>Dashboard home</h2>
        <p className="page-card__body">
          {currentUser
            ? `Welcome back, ${currentUser.username}. Your session is active and authenticated requests can now use your stored token.`
            : "The main app layout and top-level navigation are now in place. The shared feedback states below are ready to reuse when we connect real data."}
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
