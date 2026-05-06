from __future__ import annotations

from urllib.parse import urlparse


def normalize_text(value: object, *, max_length: int | None = None) -> str | None:
    if value is None:
        return None

    if not isinstance(value, str):
        return None

    normalized = " ".join(value.split())
    if not normalized:
        return None

    if max_length is not None and len(normalized) > max_length:
        normalized = normalized[:max_length].rstrip()

    return normalized or None


def normalize_http_url(value: object, *, max_length: int = 2048) -> str | None:
    normalized = normalize_text(value, max_length=max_length)
    if normalized is None:
        return None

    parsed = urlparse(normalized)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return None

    return normalized
