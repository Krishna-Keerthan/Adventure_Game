from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.game_session import GameSession, GameStatus
from app.models.story import Story, StoryNode
from app.models.user import User
from app.schemas.game_session import (
    StartSessionRequest,
    ChooseOptionRequest,
    GameSessionResponse,
    GameSessionSummary,
    CurrentNodeResponse,
)
from app.core.dependencies import get_current_user


router = APIRouter(prefix="/sessions", tags=["game_sessions"])


def _build_session_response(session: GameSession, db: Session) -> GameSessionResponse:
    node = db.query(StoryNode).filter(StoryNode.id == session.current_node_id).first()

    # Bug 1 fixed: was filtering Story by current_node_id instead of story_id
    # and had a duplicate .filter(Story) call
    story = db.query(Story).filter(Story.id == session.story_id).first()

    return GameSessionResponse(
        id=session.id,
        story_id=session.story_id,
        story_title=story.title,
        status=session.status,
        started_at=session.started_at,
        completed_at=session.completed_at,
        current_node=CurrentNodeResponse(
            node_id=node.id,
            content=node.content,
            is_ending=node.is_ending,
            is_winning_ending=node.is_winning_ending,
            options=node.options if not node.is_ending else [],
        ),
    )


@router.post("/start", response_model=GameSessionResponse, status_code=status.HTTP_201_CREATED)
def start_session(
    request: StartSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = db.query(Story).filter(Story.id == request.story_id).first()
    if not story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found.")

    # Bug 2 fixed: missing .first() — was returning a Query object, not a StoryNode
    root_node = db.query(StoryNode).filter(
        StoryNode.story_id == story.id,
        StoryNode.is_root == True,
    ).first()

    if not root_node:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Story has no root node.",
        )

    existing = db.query(GameSession).filter(
        GameSession.user_id == current_user.id,
        GameSession.story_id == story.id,
        GameSession.status == GameStatus.Inprogress,
    ).first()

    if existing:
        return _build_session_response(existing, db)

    session = GameSession(
        user_id=current_user.id,
        story_id=story.id,
        current_node_id=root_node.id,
        status=GameStatus.Inprogress,
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return _build_session_response(session, db)


@router.post("/{session_id}/choose", response_model=GameSessionResponse)
def choose_option(
    session_id: int,
    request: ChooseOptionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(GameSession).filter(GameSession.id == session_id).first()

    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")

    if session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    if session.status != GameStatus.Inprogress:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is already completed.",
        )

    current_node = db.query(StoryNode).filter(StoryNode.id == session.current_node_id).first()

    if current_node.is_ending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current node is an ending - no options available.",
        )

    options = current_node.options or []
    if request.option_index < 0 or request.option_index >= len(options):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid option index. Choose between 0 and {len(options) - 1}",
        )

    # Bug 3 fixed: variable was named choose_option, shadowing the function name
    selected_option = options[request.option_index]
    next_node_id = selected_option.get("node_id")

    next_node = db.query(StoryNode).filter(StoryNode.id == next_node_id).first()

    if not next_node:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Next node not found.")

    session.current_node_id = next_node.id

    if next_node.is_ending:
        session.status = GameStatus.Win if next_node.is_winning_ending else GameStatus.Lost
        session.completed_at = datetime.now()

    db.commit()
    db.refresh(session)

    return _build_session_response(session, db)



@router.get("/", response_model=list[GameSessionSummary])
def list_sessions(
    db: Session = Depends(get_db),
    # Bug 4 fixed: type hint was Session instead of User
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(GameSession)
        .filter(GameSession.user_id == current_user.id)
        .order_by(GameSession.started_at.desc())
        .all()
    )

    result = []
    for session in sessions:
        story = db.query(Story).filter(Story.id == session.story_id).first()
        result.append(GameSessionSummary(
            id=session.id,
            story_id=session.story_id,
            story_title=story.title if story else "Unknown",
            status=session.status,
            started_at=session.started_at,
            completed_at=session.completed_at,
        ))

    return result

@router.get("/{session_id}", response_model=GameSessionResponse)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(GameSession).filter(GameSession.id == session_id).first()

    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")

    if session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return _build_session_response(session, db)

