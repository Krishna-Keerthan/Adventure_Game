from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
import logging

from app.db.database import get_db
from app.models.game_session import GameSession, GameStatus
from app.models.user import User
from app.schemas.stats import UserStatsResponse, LeaderboardResponse, LeaderboardEntry
from app.core.dependencies import get_current_user
from app.core.cache import cache

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/stats", tags=["stats"])


def _calculate_stats(sessions: list, username: str) -> UserStatsResponse:
    total = len(sessions)
    wins = sum(1 for s in sessions if s.status == GameStatus.Win)
    losses = sum(1 for s in sessions if s.status == GameStatus.Lost)
    in_progress = sum(1 for s in sessions if s.status == GameStatus.Inprogress)
    win_rate = round((wins / total) * 100, 2) if total > 0 else 0.0

    return UserStatsResponse(
        username=username,
        total_games=total,
        wins=wins,
        losses=losses,
        in_progress=in_progress,
        win_rate=win_rate,
    )


def _fetch_leaderboard_from_db(db: Session) -> LeaderboardResponse:
    """
    Single SQL query — no Python loops over users.
    Aggregates wins and total games directly in the database.
    """
    results = (
        db.query(
            User.username,
            func.count(GameSession.id).label("total_games"),
            func.sum(
                case((GameSession.status == GameStatus.Win, 1), else_=0)
            ).label("wins"),
        )
        .outerjoin(GameSession, GameSession.user_id == User.id)
        .group_by(User.id, User.username)
        .order_by(
            func.sum(
                case((GameSession.status == GameStatus.Win, 1), else_=0)
            ).desc()
        )
        .all()
    )

    entries = []
    for i, row in enumerate(results):
        total = row.total_games or 0
        wins = row.wins or 0
        win_rate = round((wins / total) * 100, 2) if total > 0 else 0.0
        entries.append(
            LeaderboardEntry(
                rank=i + 1,
                username=row.username,
                wins=wins,
                total_games=total,
                win_rate=win_rate,
            )
        )

    return LeaderboardResponse(entries=entries)


@router.get("/me", response_model=UserStatsResponse)
def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(GameSession)
        .filter(GameSession.user_id == current_user.id)
        .all()
    )
    return _calculate_stats(sessions, current_user.username)


@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Try Redis cache first
    cached = cache.get(cache.LEADERBOARD_KEY)
    if cached is not None:
        logger.debug("Leaderboard served from Redis cache")
        return LeaderboardResponse(**cached)

    # 2. Cache miss — query the database
    logger.debug("Leaderboard cache miss — querying database")
    leaderboard = _fetch_leaderboard_from_db(db)

    # 3. Store in Redis for 5 minutes
    stored = cache.set(
        cache.LEADERBOARD_KEY,
        leaderboard.model_dump(),
        cache.LEADERBOARD_TTL,
    )
    if stored:
        logger.debug("Leaderboard stored in Redis cache")
    else:
        logger.debug("Leaderboard not cached — Redis unavailable, serving fresh from DB")

    return leaderboard