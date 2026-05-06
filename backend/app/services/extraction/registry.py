from __future__ import annotations

from app.services.extraction.types import (
    EntityExtractionAdapter,
    EntityType,
    UnsupportedEntityTypeError,
)


class EntityExtractionRegistry:
    """Maps supported entity types to their extraction adapters."""

    def __init__(self, adapters: list[EntityExtractionAdapter] | None = None) -> None:
        self._adapters: dict[EntityType, EntityExtractionAdapter] = {}
        for adapter in adapters or []:
            self.register(adapter)

    def register(self, adapter: EntityExtractionAdapter) -> None:
        self._adapters[adapter.entity_type] = adapter

    def get(self, entity_type: EntityType) -> EntityExtractionAdapter:
        adapter = self._adapters.get(entity_type)
        if adapter is None:
            raise UnsupportedEntityTypeError(
                f"Unsupported extraction entity type: {entity_type}"
            )

        return adapter
