from datetime import datetime

from sqlalchemy.orm import Session

from app.models.job_application import JobApplication
from app.schemas.job_application import JobApplicationCreate, JobApplicationUpdate

# SQL injection guardrail:
# Keep user input inside SQLAlchemy expressions and bound parameters.
# If search/filter/sort is added here later, do not concatenate raw SQL strings.
# For sorting, map client keys through an explicit whitelist of model columns.

ARCHIVE_UPDATE_FIELDS = {"is_archived", "archived_at", "archive_reason"}


def get_job_application(db: Session, job_application_id: int) -> JobApplication | None:
    return (
        db.query(JobApplication).filter(JobApplication.id == job_application_id).first()
    )


def get_job_application_for_user(
    db: Session, job_application_id: int, user_id: int
) -> JobApplication | None:
    return (
        db.query(JobApplication)
        .filter(JobApplication.id == job_application_id, JobApplication.user_id == user_id)
        .first()
    )


def get_job_applications_by_user(
    db: Session, user_id: int, skip: int = 0, limit: int = 100
) -> list[JobApplication]:
    return (
        db.query(JobApplication)
        .filter(JobApplication.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_job_applications(
    db: Session, skip: int = 0, limit: int = 100
) -> list[JobApplication]:
    return db.query(JobApplication).offset(skip).limit(limit).all()


def create_job_application(
    db: Session, job_application: JobApplicationCreate, user_id: int
) -> JobApplication:
    db_job_application = JobApplication(**job_application.model_dump(), user_id=user_id)
    db.add(db_job_application)
    db.commit()
    db.refresh(db_job_application)
    return db_job_application


def normalize_archive_reason(value: str | None) -> str | None:
    if value is None:
        return None

    normalized_value = value.strip()
    return normalized_value or None


def apply_archive_update_rules(
    db_job_application: JobApplication,
    update_data: dict[str, object],
) -> dict[str, object]:
    if "archive_reason" in update_data:
        update_data["archive_reason"] = normalize_archive_reason(
            update_data["archive_reason"] if isinstance(update_data["archive_reason"], str) else None
        )

    requested_is_archived = update_data.get("is_archived")
    effective_is_archived = (
        requested_is_archived
        if isinstance(requested_is_archived, bool)
        else db_job_application.is_archived
    )

    if effective_is_archived:
        archived_at = update_data.get("archived_at")
        if not isinstance(archived_at, datetime):
            update_data["archived_at"] = db_job_application.archived_at or datetime.utcnow()
        return update_data

    archive_reason = update_data.get("archive_reason")
    archived_at = update_data.get("archived_at")

    if archived_at is not None:
        raise ValueError("archived_at can only be set for archived job applications")

    if archive_reason is not None:
        raise ValueError("archive_reason can only be set for archived job applications")

    update_data["archived_at"] = None
    update_data["archive_reason"] = None
    return update_data


def apply_job_application_updates(
    db_job_application: JobApplication,
    job_application_update: JobApplicationUpdate,
) -> None:
    update_data = job_application_update.model_dump(exclude_unset=True)
    update_data = apply_archive_update_rules(db_job_application, update_data)

    # Archive state is updated through the same flow as other editable fields.
    # We intentionally do not derive or overwrite workflow status here.
    for field, value in update_data.items():
        if field in ARCHIVE_UPDATE_FIELDS:
            setattr(db_job_application, field, value)
            continue

        setattr(db_job_application, field, value)


def update_job_application(
    db: Session, job_application_id: int, job_application_update: JobApplicationUpdate
) -> JobApplication | None:
    db_job_application = (
        db.query(JobApplication).filter(JobApplication.id == job_application_id).first()
    )
    if not db_job_application:
        return None

    apply_job_application_updates(db_job_application, job_application_update)
    db.commit()
    db.refresh(db_job_application)
    return db_job_application


def delete_job_application(db: Session, job_application_id: int) -> bool:
    db_job_application = (
        db.query(JobApplication).filter(JobApplication.id == job_application_id).first()
    )
    if not db_job_application:
        return False
    db.delete(db_job_application)
    db.commit()
    return True
