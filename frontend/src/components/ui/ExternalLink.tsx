import { getExternalLinkLabel, getSafeExternalUrl } from "../../utils/display";

interface ExternalLinkProps {
  className?: string;
  fallback?: string;
  label?: string;
  url: string | null | undefined;
}

export function ExternalLink({
  className = "details-link",
  fallback = "Not set",
  label,
  url,
}: ExternalLinkProps) {
  const safeUrl = getSafeExternalUrl(url);

  if (!safeUrl) {
    return <span>{fallback}</span>;
  }

  return (
    <a
      className={className}
      href={safeUrl}
      rel="noopener noreferrer"
      target="_blank"
      title={safeUrl}
    >
      {label ?? getExternalLinkLabel(safeUrl, "Open link")}
    </a>
  );
}
