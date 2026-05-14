"""normalize job application type values

Revision ID: c4a9d7e2f1b8
Revises: 9c1f4c2d7ab1
Create Date: 2026-05-14 20:30:00.000000

"""
from collections.abc import Sequence

from alembic import op


revision: str = "c4a9d7e2f1b8"
down_revision: str | Sequence[str] | None = "9c1f4c2d7ab1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE job_applications
        SET application_type = 'direct_from_site'
        WHERE application_type = 'direct'
        """
    )
    op.execute(
        """
        UPDATE job_applications
        SET application_type = 'through_connection'
        WHERE application_type = 'through connection'
        """
    )


def downgrade() -> None:
    # This data migration is intentionally not reversed automatically.
    # After rollout, canonical values may also exist from normal app usage,
    # so converting all canonical values back to legacy strings would be unsafe.
    pass
