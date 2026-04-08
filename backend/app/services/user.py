from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.auth import hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

def get_user(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(func.lower(User.email) == email.lower()).first()


def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(func.lower(User.username) == username.lower()).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    return db.query(User).offset(skip).limit(limit).all()


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if user is None or not verify_password(password, user.password_hash):
        return None
    return user


def create_user(db: Session, user: UserCreate) -> User:
    hashed_password = hash_password(user.password)
    db_user = User(
        username=user.username,
        email=user.email.lower(),
        password_hash=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user_update: UserUpdate) -> User | None:
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None
    update_data = user_update.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["password_hash"] = hash_password(update_data.pop("password"))
    if "email" in update_data and update_data["email"] is not None:
        update_data["email"] = update_data["email"].lower()
    for field, value in update_data.items():
        setattr(db_user, field, value)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int) -> bool:
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return False
    db.delete(db_user)
    db.commit()
    return True
