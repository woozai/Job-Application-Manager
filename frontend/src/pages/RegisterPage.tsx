import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function RegisterPage() {
  useDocumentTitle("Register | Job Application Manager");

  return (
    <section className="page-card">
      <p className="page-card__eyebrow">Authentication</p>
      <h2>Register page</h2>
      <p className="page-card__body">
        Registration has its route and shell placement ready, so the next auth tasks can focus
        on form behavior and API integration instead of layout work.
      </p>
    </section>
  );
}
