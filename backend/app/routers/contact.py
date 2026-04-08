from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactResponse, ContactUpdate
from app.services.contact import (
    create_contact,
    delete_contact,
    get_contact,
    get_contacts,
    get_contacts_by_job_application,
    update_contact,
)

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.post("/", response_model=ContactResponse)
async def create_contact_endpoint(
    contact: ContactCreate, db: Session = Depends(get_db)
) -> Contact:
    return create_contact(db, contact)


@router.get("/", response_model=list[ContactResponse])
async def read_contacts(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> list[Contact]:
    contacts = get_contacts(db, skip=skip, limit=limit)
    return contacts


@router.get("/{contact_id}", response_model=ContactResponse)
async def read_contact(contact_id: int, db: Session = Depends(get_db)) -> Contact:
    db_contact = get_contact(db, contact_id=contact_id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return db_contact


@router.get("/job-application/{job_application_id}", response_model=list[ContactResponse])
async def read_contacts_by_job_application(
    job_application_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> list[Contact]:
    contacts = get_contacts_by_job_application(
        db, job_application_id=job_application_id, skip=skip, limit=limit
    )
    return contacts


@router.put("/{contact_id}", response_model=ContactResponse)
async def update_contact_endpoint(
    contact_id: int, contact: ContactUpdate, db: Session = Depends(get_db)
) -> Contact:
    db_contact = update_contact(db, contact_id=contact_id, contact_update=contact)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return db_contact


@router.delete("/{contact_id}")
async def delete_contact_endpoint(contact_id: int, db: Session = Depends(get_db)):
    success = delete_contact(db, contact_id=contact_id)
    if not success:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Contact deleted"}