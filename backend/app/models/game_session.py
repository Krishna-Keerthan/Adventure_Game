from enum import Enum

from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base


class GameStatus(str, Enum):
    Inprogress = "in-progress"
    Lost = "lost"
    Win = "win"


class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    story_id = Column(Integer, ForeignKey("stories.id"), nullable=False, index=True)
    current_node_id = Column(Integer, ForeignKey("story_nodes.id"), nullable=False)

    status = Column(
        SQLEnum(GameStatus),
        default=GameStatus.Inprogress,
        nullable=False,
    )

    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="game_sessions")
    story = relationship("Story", back_populates="game_sessions")
    current_node = relationship("StoryNode")