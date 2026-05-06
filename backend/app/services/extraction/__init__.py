"""Shared link-extraction service boundary."""

from app.services.extraction.orchestrator import (
    ExtractionOrchestrator,
    build_default_extraction_orchestrator,
    extract_from_link,
)
from app.services.extraction.registry import (
    EntityExtractionRegistry,
    build_default_entity_extraction_registry,
)
from app.services.extraction.types import (
    AIExtractionError,
    EntityExtractionAdapter,
    ExtractionError,
    ExtractionRequest,
    ExtractionResult,
    FetchError,
    ReadableContent,
    UnsupportedEntityTypeError,
)

__all__ = [
    "AIExtractionError",
    "EntityExtractionAdapter",
    "EntityExtractionRegistry",
    "ExtractionError",
    "ExtractionOrchestrator",
    "ExtractionRequest",
    "ExtractionResult",
    "FetchError",
    "ReadableContent",
    "UnsupportedEntityTypeError",
    "build_default_entity_extraction_registry",
    "build_default_extraction_orchestrator",
    "extract_from_link",
]
