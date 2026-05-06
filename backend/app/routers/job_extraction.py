from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.core.auth import CurrentUser
from app.schemas.job_extraction import JobExtractionData, JobFromLinkRequest, JobFromLinkResponse
from app.services.extraction import AIExtractionError, FetchError, extract_from_link

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("/from-link", response_model=JobFromLinkResponse)
async def extract_job_from_link(
    payload: JobFromLinkRequest,
    current_user: CurrentUser,
) -> JobFromLinkResponse:
    del current_user

    try:
        result = extract_from_link(
            "job_application",
            str(payload.url),
            raw_text=payload.raw_text,
        )
    except FetchError as exc:
        raise HTTPException(status_code=502, detail=exc.message) from exc
    except AIExtractionError as exc:
        raise HTTPException(status_code=502, detail=exc.message) from exc

    return JobFromLinkResponse(
        data=JobExtractionData.model_validate(result.data),
        warnings=result.warnings,
    )
