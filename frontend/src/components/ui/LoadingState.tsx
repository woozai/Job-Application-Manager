interface LoadingStateProps {
  title?: string;
  message?: string;
}

export function LoadingState({
  title = "Loading",
  message = "We are preparing your next view.",
}: LoadingStateProps) {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="feedback-panel feedback-panel--loading"
    >
      <div className="loading-indicator" aria-hidden="true" />
      <div>
        <p className="feedback-panel__eyebrow">Loading state</p>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </section>
  );
}
