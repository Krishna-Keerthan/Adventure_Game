from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func, case
import logging
import math

from app.db.database import get_db
from app.models.game_session import GameSession, GameStatus
from app.models.user import User
from app.schemas.stats import (
    UserStatsResponse,
    LeaderboardResponse,
    LeaderboardEntry,
    PaginatedLeaderboardResponse,
    LeaderboardMeta,
    UserRankResponse,
)
from app.core.dependencies import get_current_user
from app.core.cache import cache

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/stats", tags=["stats"])

PAGE_SIZE = 10

# Scalable rank tier definitions — extend this list freely
RANK_TIERS = [5, 10, 30, 50, 100, 250, 500, 1000]


def _build_leaderboard_query(db: Session):
    """Single aggregation query used by all leaderboard endpoints."""
    return (
        db.query(
            User.id.label("user_id"),
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
            ).desc(),
            func.count(GameSession.id).desc(),
            User.username.asc(),
        )
    )


def _row_to_entry(row, rank: int) -> LeaderboardEntry:
    total = row.total_games or 0
    wins = row.wins or 0
    win_rate = round((wins / total) * 100, 2) if total > 0 else 0.0
    return LeaderboardEntry(
        rank=rank,
        username=row.username,
        wins=wins,
        total_games=total,
        win_rate=win_rate,
    )


def _get_tier_label(tier: int | None) -> str:
    if tier is None:
        return "All Rankings"
    return f"Top {tier}"


def _get_applicable_tiers(total_users: int) -> list[int]:
    """Return only tiers that have enough users — scales automatically."""
    return [t for t in RANK_TIERS if t <= total_users]


def _fetch_full_leaderboard(db: Session) -> list[dict]:
    """Fetch all rows for caching. Stored as list of dicts."""
    rows = _build_leaderboard_query(db).all()
    result = []
    for i, row in enumerate(rows):
        total = row.total_games or 0
        wins = row.wins or 0
        win_rate = round((wins / total) * 100, 2) if total > 0 else 0.0
        result.append({
            "rank": i + 1,
            "user_id": row.user_id,
            "username": row.username,
            "wins": wins,
            "total_games": total,
            "win_rate": win_rate,
        })
    return result


def _get_leaderboard_data(db: Session) -> list[dict]:
    """Return cached leaderboard data or fetch fresh from DB."""
    cached = cache.get(cache.LEADERBOARD_KEY)
    if cached is not None:
        logger.debug("Leaderboard served from Redis cache")
        return cached

    logger.debug("Leaderboard cache miss — querying database")
    data = _fetch_full_leaderboard(db)

    cache.set(cache.LEADERBOARD_KEY, data, cache.LEADERBOARD_TTL)
    logger.debug(f"Leaderboard cached — {len(data)} entries")
    return data


# ── Endpoints ─────────────────────────────────────────────────────────────────

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
    total = len(sessions)
    wins = sum(1 for s in sessions if s.status == GameStatus.Win)
    losses = sum(1 for s in sessions if s.status == GameStatus.Lost)
    in_progress = sum(1 for s in sessions if s.status == GameStatus.Inprogress)
    win_rate = round((wins / total) * 100, 2) if total > 0 else 0.0

    return UserStatsResponse(
        username=current_user.username,
        total_games=total,
        wins=wins,
        losses=losses,
        in_progress=in_progress,
        win_rate=win_rate,
    )


@router.get("/me/rank", response_model=UserRankResponse)
def get_my_rank(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the current user's rank and stats for the sticky card.
    Always served from cache when available.
    """
    data = _get_leaderboard_data(db)
    total_users = len(data)

    user_entry = next(
        (row for row in data if row["user_id"] == current_user.id),
        None,
    )

    if user_entry is None:
        # User has no sessions — place them at the bottom
        return UserRankResponse(
            rank=total_users + 1,
            username=current_user.username,
            wins=0,
            total_games=0,
            win_rate=0.0,
            total_users=total_users,
            percentile=0.0,
        )

    rank = user_entry["rank"]
    percentile = round(((total_users - rank) / total_users) * 100, 1) if total_users > 0 else 0.0

    return UserRankResponse(
        rank=rank,
        username=current_user.username,
        wins=user_entry["wins"],
        total_games=user_entry["total_games"],
        win_rate=user_entry["win_rate"],
        total_users=total_users,
        percentile=percentile,
    )


@router.get("/leaderboard", response_model=PaginatedLeaderboardResponse)
def get_leaderboard(\
    response: Response,
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    tier: int | None = Query(None, description="Rank tier filter e.g. 10, 50, 100"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Paginated leaderboard with optional tier filtering.
    tier=None means all users.
    tier=50 means only top 50 users.
    """
    response.headers['Cache-Control'] ="public, max-age=30, stale-while-revalidate=60"
    

    all_data = _get_leaderboard_data(db)
    total_users = len(all_data)

    # Validate tier
    valid_tiers = _get_applicable_tiers(total_users)
    if tier is not None and tier not in RANK_TIERS:
        tier = None  # invalid tier — fall back to all

    # Apply tier filter
    if tier is not None:
        scoped_data = [row for row in all_data if row["rank"] <= tier]
    else:
        scoped_data = all_data

    scoped_total = len(scoped_data)
    total_pages = max(1, math.ceil(scoped_total / PAGE_SIZE))
    page = min(page, total_pages)

    start = (page - 1) * PAGE_SIZE
    end = start + PAGE_SIZE
    page_data = scoped_data[start:end]

    response.headers["X-Total-Count"] = str(scoped_total)

    entries = [
        LeaderboardEntry(
            rank=row["rank"],
            username=row["username"],
            wins=row["wins"],
            total_games=row["total_games"],
            win_rate=row["win_rate"],
        )
        for row in page_data
    ]

    return PaginatedLeaderboardResponse(
        entries=entries,
        meta=LeaderboardMeta(
            page=page,
            page_size=PAGE_SIZE,
            total_entries=scoped_total,
            total_pages=total_pages,
            tier=tier,
            tier_label=_get_tier_label(tier),
            available_tiers=valid_tiers,
            total_users=total_users,
        ),
    )