"""add performance indexes

Revision ID: 018515f52e02
Revises: 1171ff4f40c6
Create Date: 2026-07-02 12:29:11.592135

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '018515f52e02'
down_revision: Union[str, Sequence[str], None] = '1171ff4f40c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
