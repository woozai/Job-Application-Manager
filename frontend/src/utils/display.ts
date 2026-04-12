export function formatDisplayValue(value: string | null | undefined, fallback = "Not set") {
  if (!value || value.trim().length === 0) {
    return fallback;
  }

  return value;
}

export function formatDisplayDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getExternalLinkLabel(value: string | null | undefined, fallbackLabel: string) {
  const safeUrl = getSafeExternalUrl(value);

  if (!safeUrl) {
    return "Not set";
  }

  try {
    const url = new URL(safeUrl);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return fallbackLabel;
  }
}

export function getSafeExternalUrl(value: string | null | undefined) {
  if (!value || value.trim().length === 0) {
    return null;
  }

  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
