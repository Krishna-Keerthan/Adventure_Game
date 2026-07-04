"""add_performance_indexes

Revision ID: 6b1fb088cf57
Revises: 1171ff4f40c6
Create Date: 2026-07-04 19:23:54.750842

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6b1fb088cf57'
down_revision: Union[str, Sequence[str], None] = '1171ff4f40c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_index(
        "ix_game_sessions_user_status",
        "game_sessions", ["user_id", "status"]
    )
    op.create_index(
        "ix_game_sessions_story_user",
        "game_sessions", ["story_id", "user_id"]
    )
    op.create_index(
        "ix_story_nodes_story_root",
        "story_nodes", ["story_id", "is_root"]
    )
    op.create_index(
        "ix_story_jobs_session",
        "story_jobs", ["session_id", "status"]
    )

def downgrade():
    op.drop_index("ix_story_jobs_session", table_name="story_jobs")
    op.drop_index("ix_story_nodes_story_root", table_name="story_nodes")
    op.drop_index("ix_game_sessions_story_user", table_name="game_sessions")
    op.drop_index("ix_game_sessions_user_status", table_name="game_sessions")
