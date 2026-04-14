import { formatStatusLabel, getSafeStatusTone, type StatusTone } from "../../utils/statusTone";

interface StatusBadgeProps {
  className?: string;
  fallback?: string;
  label: string | null | undefined;
  tone?: StatusTone | null;
}

export function StatusBadge({
  className,
  fallback = "Not set",
  label,
  tone,
}: StatusBadgeProps) {
  const safeTone = getSafeStatusTone(tone);
  const displayLabel = formatStatusLabel(label, fallback);
  const classNames = ["status-badge", `status-badge--${safeTone}`, className]
    .filter(Boolean)
    .join(" ");

  return <span className={classNames}>{displayLabel}</span>;
}
