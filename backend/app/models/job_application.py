from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.contact import Contact
    from app.models.user import User


class JobApplication(Base):
    __tablename__ = "job_applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    job_title: Mapped[str] = mapped_column(String(255), nullable=False)
    job_link: Mapped[str | None] = mapped_column(Text)
    source: Mapped[str | None] = mapped_column(String(100))
    application_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(100), nullable=False, default="saved", server_default="saved")
    short_description: Mapped[str | None] = mapped_column(Text)
    full_description: Mapped[str | None] = mapped_column(Text)
    required_skills: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    location: Mapped[str | None] = mapped_column(String(255))
    work_mode: Mapped[str | None] = mapped_column(String(50))
    application_type: Mapped[str | None] = mapped_column(String(50))
    priority: Mapped[str | None] = mapped_column(String(50))
    salary_range: Mapped[str | None] = mapped_column(String(100))
    resume_version: Mapped[str | None] = mapped_column(String(100))
    recruiter_name: Mapped[str | None] = mapped_column(String(255))
    last_follow_up_date: Mapped[date | None] = mapped_column(Date)
    next_action_date: Mapped[date | None] = mapped_column(Date)
    interview_stage: Mapped[str | None] = mapped_column(String(100))
    rejection_reason: Mapped[str | None] = mapped_column(Text)
    is_archived: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="0",
    )
    archived_at: Mapped[datetime | None] = mapped_column(DateTime)
    archive_reason: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(back_populates="job_applications")
    contacts: Mapped[list["Contact"]] = relationship(
        back_populates="job_application",
        cascade="all, delete-orphan",
    )
