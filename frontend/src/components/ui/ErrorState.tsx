import type { ReactNode } from "react";

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: ReactNode;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  action,
}: ErrorStateProps) {
  return (
    <section className="feedback-panel feedback-panel--error" role="alert">
      <p className="feedback-panel__eyebrow">Error state</p>
      <h3>{title}</h3>
      <p>{message}</p>
      {action ? <div className="feedback-panel__action">{action}</div> : null}
    </section>
  );
}
