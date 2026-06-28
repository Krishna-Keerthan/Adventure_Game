import uuid
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends , HTTPException, Cookie , Response, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.models.user import User

from app.db.database import get_db , SessionLocal
from app.models.story import Story , StoryNode
from app.models.job import StoryJob
from app.schemas.story import (
    CompleteStoryNodeResponse, CompleteStoryResponse, CreateStoryRequest
)
from app.schemas.job import StoryJobResponse

from app.core.story_generator import StoryGenerator

router = APIRouter(
    prefix='/stories',
    tags=["stories"]
)




@router.post("/create", response_model=StoryJobResponse)
def create_story(
    request: CreateStoryRequest, 
    background_task: BackgroundTasks, 
    response: Response, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    session_id = str(current_user.id)
    response.set_cookie(key="session_id", value=session_id, httponly=True)

    job_id = str(uuid.uuid4())
    
    job = StoryJob(
        job_id = job_id,
        session_id = session_id,
        theme = request.theme,
        status = "Pending"
    )

    db.add(job)
    db.commit()

    # Background Tasks
    background_task.add_task(
        generate_story_task,
        job_id = job_id,
        theme = request.theme,
        session_id = session_id
    )

    return job


def generate_story_task(job_id: str, theme: str, session_id: str):
    db = SessionLocal()


    try:
        job = db.query(StoryJob).filter(StoryJob.job_id == job_id).first()

        if not job:
            return
        
        try:
            job.status = "processing"
            db.commit()

            story = StoryGenerator.generate_story(db, session_id, theme)

            job.story_id = story.id
            job.status = "completed"
            job.completed_at = datetime.now()
            db.commit()
        
        except Exception as e:
            db.rollback()
            job.status = "failed"
            job.completed_at = datetime.now()
            job.error = str(e)
            db.commit()

    finally:
        db.close()



@router.get("/{story_id}/complete", response_model=CompleteStoryResponse)
def get_complete_story(
    story_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    story = db.query(Story).filter(Story.id == story_id).first()

    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    if story.session_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    

    # Parse Story
    complete_story = build_complete_story_tree(db ,story)

    return complete_story



def build_complete_story_tree(db: Session, story: Story) -> CompleteStoryResponse:
    nodes = db.query(StoryNode).filter(StoryNode.story_id == story.id).all()

    node_dict = {}

    for node in nodes:
        node_response = CompleteStoryNodeResponse(
            id = node.id,
            content=node.content,
            is_ending=node.is_ending,
            is_winning_ending=node.is_winning_ending,
            options=node.options
        )

        node_dict[node.id] = node_response


    root_node = next((node for node in  nodes if node.is_root), None )

    if not root_node:
        raise HTTPException(status_code=500, detail="Story root node not found")
    
    return CompleteStoryResponse(
        id = story.id,
        title = story.title,
        session_id = story.session_id,
        created_at = story.created_at,
        root_node = node_dict[root_node.id],
        all_nodes=node_dict
    )