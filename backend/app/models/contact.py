from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.job_application import JobApplication


class Contact(Base):
    __tablename__ = "contacts"

    id: Mapped[int] = mapped_column(primary_key=True)
    job_application_id: Mapped[int] = mapped_column(
        ForeignKey("job_applications.id"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    profile_link: Mapped[str | None] = mapped_column(Text)
    company: Mapped[str | None] = mapped_column(String(255))
    job_title: Mapped[str | None] = mapped_column(String(255))
    relationship_type: Mapped[str | None] = mapped_column(String(100))
    priority: Mapped[str | None] = mapped_column(String(50))
    connection_requested_at: Mapped[date | None] = mapped_column(Date)
    connection_approved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="0")
    connection_approved_at: Mapped[date | None] = mapped_column(Date)
    message_sent: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="0")
    message_sent_at: Mapped[date | None] = mapped_column(Date)
    response_status: Mapped[str | None] = mapped_column(String(100))
    last_interaction_date: Mapped[date | None] = mapped_column(Date)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    job_application: Mapped["JobApplication"] = relationship(back_populates="contacts")
