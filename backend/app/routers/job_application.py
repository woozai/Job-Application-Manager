from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.job_application import JobApplication
from app.schemas.job_application import (
    JobApplicationCreate,
    JobApplicationResponse,
    JobApplicationUpdate,
)
from app.services.job_application import (
    create_job_application,
    delete_job_application,
    get_job_application,
    get_job_applications,
    get_job_applications_by_user,
    update_job_application,
)

router = APIRouter(prefix="/job-applications", tags=["job-applications"])


@router.post("/", response_model=JobApplicationResponse)
async def create_job_application_endpoint(
    job_application: JobApplicationCreate, db: Session = Depends(get_db)
) -> JobApplication:
    return create_job_application(db, job_application)


@router.get("/", response_model=list[JobApplicationResponse])
async def read_job_applications(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> list[JobApplication]:
    job_applications = get_job_applications(db, skip=skip, limit=limit)
    return job_applications


@router.get("/{job_application_id}", response_model=JobApplicationResponse)
async def read_job_application(
    job_application_id: int, db: Session = Depends(get_db)
) -> JobApplication:
    db_job_application = get_job_application(db, job_application_id=job_application_id)
    if db_job_application is None:
        raise HTTPException(status_code=404, detail="Job application not found")
    return db_job_application


@router.get("/user/{user_id}", response_model=list[JobApplicationResponse])
async def read_job_applications_by_user(
    user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> list[JobApplication]:
    job_applications = get_job_applications_by_user(
        db, user_id=user_id, skip=skip, limit=limit
    )
    return job_applications


@router.put("/{job_application_id}", response_model=JobApplicationResponse)
async def update_job_application_endpoint(
    job_application_id: int,
    job_application: JobApplicationUpdate,
    db: Session = Depends(get_db),
) -> JobApplication:
    db_job_application = update_job_application(
        db, job_application_id=job_application_id, job_application_update=job_application
    )
    if db_job_application is None:
        raise HTTPException(status_code=404, detail="Job application not found")
    return db_job_application


@router.delete("/{job_application_id}")
async def delete_job_application_endpoint(job_application_id: int, db: Session = Depends(get_db)):
    success = delete_job_application(db, job_application_id=job_application_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job application not found")
    return {"message": "Job application deleted"}