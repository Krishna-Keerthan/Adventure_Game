from pydantic import BaseModel
from typing import Optional


class UserStatsResponse(BaseModel):
    username: str
    total_games: int
    wins: int
    losses: int
    in_progress: int
    win_rate: float


class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    wins: int
    total_games: int
    win_rate: float


class LeaderboardMeta(BaseModel):
    page: int
    page_size: int
    total_entries: int
    total_pages: int
    tier: Optional[int]
    tier_label: str
    available_tiers: list[int]
    total_users: int


class PaginatedLeaderboardResponse(BaseModel):
    entries: list[LeaderboardEntry]
    meta: LeaderboardMeta


class UserRankResponse(BaseModel):
    rank: int
    username: str
    wins: int
    total_games: int
    win_rate: float
    total_users: int
    percentile: float


# Keep for backward compat if anything imports this
class LeaderboardResponse(BaseModel):
    entries: list[LeaderboardEntry]