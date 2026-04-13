from datetime import date

from sqlalchemy.orm import Session

from app.models.contact import Contact
from app.models.job_application import JobApplication
from app.schemas.contact import ContactCreate, ContactUpdate

# SQL injection guardrail:
# Keep user input inside SQLAlchemy expressions and bound parameters.
# If search/filter/sort is added here later, do not concatenate raw SQL strings.
# For sorting, map client keys through an explicit whitelist of model columns.


CONTACT_ACTIVITY_FIELDS = {
    "connection_requested_at",
    "connection_approved",
    "connection_approved_at",
    "message_sent",
    "message_sent_at",
    "response_status",
    "notes",
}


def get_automatic_last_activity(
    contact_data: dict[str, object],
    *,
    mark_today_when_activity_changes: bool,
) -> date | None:
    explicit_dates = [
        value
        for field in (
            "connection_requested_at",
            "connection_approved_at",
            "message_sent_at",
        )
        if isinstance((value := contact_data.get(field)), date)
    ]

    if explicit_dates:
        return max(explicit_dates)

    has_activity_marker = bool(contact_data.get("connection_approved")) or bool(
        contact_data.get("message_sent")
    )
    response_status = contact_data.get("response_status")
    notes = contact_data.get("notes")

    if isinstance(response_status, str) and response_status.strip():
        has_activity_marker = True

    if isinstance(notes, str) and notes.strip():
        has_activity_marker = True

    if has_activity_marker or (
        mark_today_when_activity_changes
        and CONTACT_ACTIVITY_FIELDS.intersection(contact_data)
    ):
        return date.today()

    return None


def get_contact(db: Session, contact_id: int) -> Contact | None:
    return db.query(Contact).filter(Contact.id == contact_id).first()


def get_contact_for_user(db: Session, contact_id: int, user_id: int) -> Contact | None:
    return (
        db.query(Contact)
        .join(JobApplication, Contact.job_application_id == JobApplication.id)
        .filter(Contact.id == contact_id, JobApplication.user_id == user_id)
        .first()
    )


def get_contacts_by_job_application(
    db: Session, job_application_id: int, skip: int = 0, limit: int = 100
) -> list[Contact]:
    return (
        db.query(Contact)
        .filter(Contact.job_application_id == job_application_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_contacts(db: Session, skip: int = 0, limit: int = 100) -> list[Contact]:
    return db.query(Contact).offset(skip).limit(limit).all()


def get_contacts_for_user(
    db: Session, user_id: int, skip: int = 0, limit: int = 100
) -> list[Contact]:
    return (
        db.query(Contact)
        .join(JobApplication, Contact.job_application_id == JobApplication.id)
        .filter(JobApplication.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_contact(db: Session, contact: ContactCreate) -> Contact:
    contact_data = contact.model_dump()
    contact_data["last_interaction_date"] = get_automatic_last_activity(
        contact_data,
        mark_today_when_activity_changes=False,
    )
    db_contact = Contact(**contact_data)
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact


def update_contact(
    db: Session, contact_id: int, contact_update: ContactUpdate
) -> Contact | None:
    db_contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not db_contact:
        return None
    update_data = contact_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_contact, field, value)

    automatic_last_activity = get_automatic_last_activity(
        update_data,
        mark_today_when_activity_changes=True,
    )
    if automatic_last_activity is not None:
        db_contact.last_interaction_date = automatic_last_activity

    db.commit()
    db.refresh(db_contact)
    return db_contact


def delete_contact(db: Session, contact_id: int) -> bool:
    db_contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not db_contact:
        return False
    db.delete(db_contact)
    db.commit()
    return True
