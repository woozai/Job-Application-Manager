from sqlalchemy.orm import Session

from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactUpdate


def get_contact(db: Session, contact_id: int) -> Contact | None:
    return db.query(Contact).filter(Contact.id == contact_id).first()


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


def create_contact(db: Session, contact: ContactCreate) -> Contact:
    db_contact = Contact(**contact.model_dump())
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