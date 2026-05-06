"""remove tags and source_link from job applications

Revision ID: 9c1f4c2d7ab1
Revises: 2f6b6d8d3c4a
Create Date: 2026-05-06 20:05:00.000000

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "9c1f4c2d7ab1"
down_revision: str | Sequence[str] | None = "2f6b6d8d3c4a"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("job_applications") as batch_op:
        batch_op.drop_column("source_link")
        batch_op.drop_column("tags")


def downgrade() -> None:
    with op.batch_alter_table("job_applications") as batch_op:
        batch_op.add_column(sa.Column("tags", sa.Text(), nullable=True))
        batch_op.add_column(sa.Column("source_link", sa.Text(), nullable=True))
