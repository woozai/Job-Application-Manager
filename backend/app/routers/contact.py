from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.auth import CurrentUser
from app.db.session import get_db
from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactResponse, ContactUpdate
from app.services.contact import (
    create_contact,
    delete_contact,
    get_contact_for_user,
    get_contacts_for_user,
    get_contacts_by_job_application,
    update_contact,
)
from app.services.job_application import get_job_application_for_user

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.post("/", response_model=ContactResponse)
async def create_contact_endpoint(
    contact: ContactCreate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> Contact:
    job_application = get_job_application_for_user(
        db,
        job_application_id=contact.job_application_id,
        user_id=current_user.id,
    )
    if job_application is None:
        raise HTTPException(status_code=404, detail="Job application not found")
    return create_contact(db, contact)


@router.get("/", response_model=list[ContactResponse])
async def read_contacts(
    current_user: CurrentUser,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[Contact]:
    return get_contacts_for_user(db, user_id=current_user.id, skip=skip, limit=limit)


@router.get("/{contact_id}", response_model=ContactResponse)
async def read_contact(
    contact_id: int,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> Contact:
    db_contact = get_contact_for_user(db, contact_id=contact_id, user_id=current_user.id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return db_contact


@router.get(
    "/job-application/{job_application_id}", response_model=list[ContactResponse]
)
async def read_contacts_by_job_application(
    job_application_id: int,
    current_user: CurrentUser,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[Contact]:
    job_application = get_job_application_for_user(
        db,
        job_application_id=job_application_id,
        user_id=current_user.id,
    )
    if job_application is None:
        raise HTTPException(status_code=404, detail="Job application not found")

    return get_contacts_by_job_application(
        db, job_application_id=job_application_id, skip=skip, limit=limit
    )


@router.put("/{contact_id}", response_model=ContactResponse)
async def update_contact_endpoint(
    contact_id: int,
    contact: ContactUpdate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> Contact:
    existing_contact = get_contact_for_user(db, contact_id=contact_id, user_id=current_user.id)
    if existing_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")

    if contact.job_application_id is not None:
        job_application = get_job_application_for_user(
            db,
            job_application_id=contact.job_application_id,
            user_id=current_user.id,
        )
        if job_application is None:
            raise HTTPException(status_code=404, detail="Job application not found")

    db_contact = update_contact(db, contact_id=contact_id, contact_update=contact)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return db_contact


@router.delete("/{contact_id}")
async def delete_contact_endpoint(
    contact_id: int,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    existing_contact = get_contact_for_user(db, contact_id=contact_id, user_id=current_user.id)
    if existing_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")

    success = delete_contact(db, contact_id=contact_id)
    if not success:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Contact deleted"}
