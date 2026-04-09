import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="page-card">
      <p className="page-card__eyebrow">404</p>
      <h2>That page does not exist</h2>
      <p className="page-card__body">
        The route could not be found. Head back to the dashboard to keep working.
      </p>
      <Link className="button-link" to="/dashboard">
        Go to dashboard
      </Link>
    </section>
  );
}
