from pydantic import BaseModel
from typing import List

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


class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]