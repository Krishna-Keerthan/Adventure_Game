from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.game_session import GameSession, GameStatus
from app.models.user import User
from app.schemas.stats import UserStatsResponse, LeaderboardResponse, LeaderboardEntry
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/stats", tags=["stats"])


def _calculate_stats(
        sessions: list[GameSession],
        username: str
) -> UserStatsResponse:
    
    total = len(sessions)
    wins = sum(1 for s in sessions if s.status == GameStatus.Win)
    losses = sum(1 for s in sessions if s.status == GameStatus.Lost)
    in_progress = sum(1 for s in sessions if s.status == GameStatus.Inprogress)
    win_rate = round((wins/total) * 100 , 2) if total > 0 else 0.00

    return UserStatsResponse(
        username=username,
        total_games=total,
        wins=wins,
        losses=losses,
        in_progress=in_progress,
        win_rate=win_rate
    )



@router.get("/me", response_model=UserStatsResponse)
def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = db.query(GameSession).filter(
        GameSession.user_id == current_user.id
    ).all()

    return _calculate_stats(sessions, current_user.username)


@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    users = db.query(User).all()

    entries = []
    for user in users:
        sessions = db.query(GameSession).filter(
            GameSession.user_id == user.id
        ).all()

        total = len(sessions)
        wins = sum(1 for s in sessions if s.status == "won")
        win_rate = round((wins / total) * 100, 2) if total > 0 else 0.0

        entries.append({
            "username": user.username,
            "wins": wins,
            "total_games": total,
            "win_rate": win_rate,
        })

    # Sort by wins desc, then win_rate desc
    entries.sort(key=lambda x: (x["wins"], x["win_rate"]), reverse=True)

    return LeaderboardResponse(
        entries=[
            LeaderboardEntry(rank=i + 1, **entry)
            for i, entry in enumerate(entries)
        ]
    )