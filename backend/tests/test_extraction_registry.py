from __future__ import annotations

import pytest

from app.services.extraction.registry import build_default_entity_extraction_registry
from app.services.extraction.types import UnsupportedEntityTypeError


def test_default_registry_registers_supported_entities() -> None:
    registry = build_default_entity_extraction_registry()

    assert registry.get("job_application").entity_type == "job_application"
    assert registry.get("contact").entity_type == "contact"


def test_default_registry_rejects_unsupported_entity_type() -> None:
    registry = build_default_entity_extraction_registry()

    with pytest.raises(UnsupportedEntityTypeError):
        registry.get("job_application_typo")  # type: ignore[arg-type]
