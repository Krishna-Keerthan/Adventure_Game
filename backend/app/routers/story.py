import uuid
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends , HTTPException, Cookie , Response, BackgroundTasks
from sqlalchemy.orm import Session

from db.database import get_db , SessionLocal
from models.story import Story , StoryNode
from models.job import StoryJob
from schemas.story import (
    CompleteStoryNodeResponse, CompleteStoryResonse, CreateStoryRequest
)
from schemas.job import StoryJobResponse


router = APIRouter(
    prefix='/stories',
    tags=["stories"]
)


def get_session_id(session_id: Optional[str] = Cookie(None)):
    if not session_id:
        session_id = str(uuid.uuid4())
    return session_id