from fastapi import APIRouter , Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.models.user import User

from app.db.database import get_db
from app.models.job import StoryJob
from app.schemas.job import StoryJobResponse

router = APIRouter(
    prefix="/jobs",
    tags=["jobs"]
)

@router.get("/{job_id}", response_model=StoryJobResponse)
def get_job_status(
    job_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(StoryJob).filter(StoryJob.job_id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.session_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied.")
    
    return job