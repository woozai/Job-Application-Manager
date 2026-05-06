from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.core.auth import CurrentUser
from app.schemas.job_extraction import JobExtractionData, JobFromLinkRequest, JobFromLinkResponse
from app.services.extraction import AIExtractionError, FetchError, extract_from_link

router = APIRouter(prefix="/jobs", tags=["jobs"])
logger = logging.getLogger(__name__)


@router.post("/from-link", response_model=JobFromLinkResponse)
async def extract_job_from_link(
    payload: JobFromLinkRequest,
    current_user: CurrentUser,
) -> JobFromLinkResponse:
    logger.info(
        "Received job extraction request",
        extra={"user_id": current_user.id, "url": str(payload.url), "used_raw_text": bool(payload.raw_text)},
    )

    try:
        result = extract_from_link(
            "job_application",
            str(payload.url),
            raw_text=payload.raw_text,
        )
    except FetchError as exc:
        logger.warning(
            "Job extraction request failed during fetch stage",
            extra={"user_id": current_user.id, "url": str(payload.url), "reason": exc.message},
        )
        raise HTTPException(status_code=502, detail=exc.message) from exc
    except AIExtractionError as exc:
        logger.warning(
            "Job extraction request failed during AI stage",
            extra={"user_id": current_user.id, "url": str(payload.url), "reason": exc.message},
        )
        raise HTTPException(status_code=502, detail=exc.message) from exc

    logger.info(
        "Job extraction request completed",
        extra={
            "user_id": current_user.id,
            "url": str(payload.url),
            "warning_count": len(result.warnings),
            "filled_fields": sorted([key for key, value in result.data.items() if value]),
        },
    )
    return JobFromLinkResponse(
        data=JobExtractionData.model_validate(result.data),
        warnings=result.warnings,
    )
