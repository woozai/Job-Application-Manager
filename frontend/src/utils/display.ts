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
  if (!value || value.trim().length === 0) {
    return "Not set";
  }

  try {
    const url = new URL(value);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return fallbackLabel;
  }
}
