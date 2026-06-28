from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List , Optional
from app.models.game_session import GameStatus

class StartSessionRequest(BaseModel):
    story_id: int

class ChooseOptionRequest(BaseModel):
    option_index: int

class CurrentNodeResponse(BaseModel):
    node_id: int
    content: str
    is_ending: bool
    is_winning_ending: bool
    options: List[dict]

class GameSessionResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int
    story_id: int
    story_title: str
    status: GameStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    current_node: CurrentNodeResponse


class GameSessionSummary(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int
    story_id: int
    story_title: str
    status: GameStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
