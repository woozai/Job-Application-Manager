from __future__ import annotations

from urllib.parse import urlparse


def _contains_disallowed_control_characters(value: str) -> bool:
    return any(
        ord(character) < 32 and character not in {"\n", "\r", "\t"}
        for character in value
    )


def validate_required_text(value: object, *, field_name: str) -> str:
    if not isinstance(value, str):
        raise ValueError(f"{field_name} must be a string")

    normalized_value = value.strip()
    if normalized_value == "":
        raise ValueError(f"{field_name} cannot be empty")

    if _contains_disallowed_control_characters(normalized_value):
        raise ValueError(f"{field_name} contains unsupported control characters")

    return normalized_value


def validate_optional_text(value: object, *, field_name: str) -> str | None:
    if value is None:
        return None

    if not isinstance(value, str):
        raise ValueError(f"{field_name} must be a string")

    normalized_value = value.strip()
    if normalized_value == "":
        return None

    if _contains_disallowed_control_characters(normalized_value):
        raise ValueError(f"{field_name} contains unsupported control characters")

    return normalized_value


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


def validate_optional_choice(
    value: object,
    *,
    field_name: str,
    allowed_values: tuple[str, ...],
) -> str | None:
    normalized_value = validate_optional_text(value, field_name=field_name)
    if normalized_value is None:
        return None

    if normalized_value not in allowed_values:
        allowed_values_text = ", ".join(allowed_values)
        raise ValueError(f"{field_name} must be one of: {allowed_values_text}")

    return normalized_value
