"""add archive fields to job applications

Revision ID: 2f6b6d8d3c4a
Revises: 79b2eeb05df7
Create Date: 2026-05-06 17:55:00.000000

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "2f6b6d8d3c4a"
down_revision: str | Sequence[str] | None = "79b2eeb05df7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "job_applications",
        sa.Column(
            "is_archived",
            sa.Boolean(),
            nullable=False,
            server_default="0",
        ),
    )
    op.add_column(
        "job_applications",
        sa.Column("archived_at", sa.DateTime(), nullable=True),
    )
    op.add_column(
        "job_applications",
        sa.Column("archive_reason", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("job_applications", "archive_reason")
    op.drop_column("job_applications", "archived_at")
    op.drop_column("job_applications", "is_archived")
