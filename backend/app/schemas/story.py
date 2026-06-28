from typing import List, Optional, Dict
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class StoryOptionsSchema(BaseModel):
    text: str
    node_id: Optional[int] = None


#Parent class
class StoryNodeBase(BaseModel):
    content: str
    is_ending: bool = False
    is_winning_ending: bool = False

class CompleteStoryNodeResponse(StoryNodeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    options: List[StoryOptionsSchema] = []


class StoryBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    title: str
    session_id: Optional[str] = None


class CreateStoryRequest(BaseModel):
    theme: str


class CompleteStoryResponse(StoryBase):

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    root_node: CompleteStoryNodeResponse
    all_nodes: Dict[int, CompleteStoryNodeResponse]
