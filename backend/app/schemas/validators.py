from __future__ import annotations

from urllib.parse import urlparse


def validate_optional_http_url(value: object) -> str | None:
    if value is None:
        return None

    if not isinstance(value, str):
        raise ValueError("URL must be a string")

    normalized_value = value.strip()
    if normalized_value == "":
        return None

    parsed_url = urlparse(normalized_value)
    if parsed_url.scheme not in {"http", "https"} or not parsed_url.netloc:
        raise ValueError("URL must be a valid http or https URL")

    return normalized_value
