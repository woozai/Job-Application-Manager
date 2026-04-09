import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function LoginPage() {
  useDocumentTitle("Login | Job Application Manager");

  return (
    <section className="page-card">
      <p className="page-card__eyebrow">Authentication</p>
      <h2>Login page</h2>
      <p className="page-card__body">
        This route is part of the shared app shell now, so auth pages and main app pages
        already live under one consistent layout and navigation model.
      </p>
    </section>
  );
}
