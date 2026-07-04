"""
Seed the database with realistic demo data.
Run: uv run python scripts/seed_data.py

Uses your production DATABASE_URL if set, otherwise SQLite.
Safe to run multiple times — checks for existing data first.
"""
import os
import sys
import random
import hashlib
import bcrypt
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.db.database import Base
from app.models.user import User
from app.models.story import Story, StoryNode
from app.models.game_session import GameSession, GameStatus
from app.models.job import StoryJob

# ── Fake data ─────────────────────────────────────────────────────────────────

USERNAMES = [
    "ShadowQuester", "IronVeil", "ArcaneWanderer", "StormRider",
    "CrimsonBlade", "NightWatcher", "FrostHunter", "EmberKnight",
    "VoidStalker", "GoldenLance", "SilverFang", "DuskRanger",
    "ThunderPath", "MoonSeeker", "StarForged", "DawnBreaker",
    "IronMaiden", "StoneCrow", "WildHarbor", "BlazeFury",
    "OakShield", "RavenClaw", "ThistleSword", "CoralMage",
    "AshenHand", "WinterEdge", "BronzeArrow", "CedarFist",
    "MarbleEye", "CopperSeal", "AmberPath", "JadeMist",
    "PearlDusk", "RubyStride", "SapphireWake", "GarnetCall",
    "OpalDrift", "TopazHunt", "OnxyxVeil", "PeridotRun",
    "TanzaniteSky", "SpinelCrest", "ZirconFall", "DiamondEcho",
    "EmeraldRoar", "RubyFlame", "SapphireRain", "GoldenEagle",
    "SilverWolf", "CrimsonDragon",
]

THEMES = [
    "pirate treasure hunt in the Caribbean",
    "medieval fantasy kingdom under siege",
    "cyberpunk heist in Neo Tokyo",
    "ancient Egypt tomb exploration",
    "space exploration on a dying planet",
    "Viking saga across frozen seas",
    "underwater kingdom discovery",
    "time travel mystery in Victorian London",
    "dark forest survival horror",
    "dragon taming in a magical realm",
]

STORY_TITLES = [
    "The Lost Anchor of Kalidor",
    "Siege of the Iron Crown",
    "Ghost Protocol: Neo City",
    "Beneath the Sands of Ra",
    "Last Signal from Kepler-9",
    "Blood and Ice: The Saga of Ulf",
    "Depths of the Abyssal Court",
    "The Whitechapel Paradox",
    "Where the Dark Things Wait",
    "Wings of the Embered Wyrm",
]


def _hash_password(password: str) -> str:
    prepared = hashlib.sha256(password.encode()).hexdigest().encode()
    return bcrypt.hashpw(prepared, bcrypt.gensalt()).decode()


def _create_story_tree(db: Session, story: Story) -> tuple[StoryNode, StoryNode, StoryNode]:
    """Create a minimal but complete story tree — root → two endings."""
    root = StoryNode(
        story_id=story.id,
        content=(
            "You stand at the threshold of your destiny. "
            "Two paths lie before you, each shrouded in mystery. "
            "Your choices here will echo through history."
        ),
        is_root=True,
        is_ending=False,
        is_winning_ending=False,
        options=[],
    )
    db.add(root)
    db.flush()

    win_node = StoryNode(
        story_id=story.id,
        content=(
            "Against all odds, you prevail. The prize is yours — "
            "hard-won through courage and cunning. Your legend is written."
        ),
        is_root=False,
        is_ending=True,
        is_winning_ending=True,
        options=[],
    )
    lose_node = StoryNode(
        story_id=story.id,
        content=(
            "The shadows close in. This time, the darkness wins. "
            "But every defeat is a lesson — your story isn't over yet."
        ),
        is_root=False,
        is_ending=True,
        is_winning_ending=False,
        options=[],
    )
    db.add(win_node)
    db.add(lose_node)
    db.flush()

    root.options = [
        {"text": "Press forward with everything you have", "node_id": win_node.id},
        {"text": "Take the cautious route", "node_id": lose_node.id},
    ]
    db.flush()

    return root, win_node, lose_node


def seed(db: Session):
    existing_count = db.query(User).count()
    if existing_count >= 40:
        print(f"Database already has {existing_count} users — skipping seed.")
        return

    print(f"Seeding database with {len(USERNAMES)} users...")

    password_hash = _hash_password("Demo@1234")
    created_users = []

    for i, username in enumerate(USERNAMES):
        # Check if user already exists
        if db.query(User).filter(User.username == username).first():
            continue

        user = User(
            username=username,
            email=f"{username.lower()}@questcraft.demo",
            hashed_password=password_hash,
        )
        db.add(user)
        db.flush()
        created_users.append(user)
        print(f"  Created user {i+1}/{len(USERNAMES)}: {username}")

    db.commit()
    print(f"\nCreated {len(created_users)} users. Now generating game history...")

    # Generate varied game history per user
    for user in created_users:
        num_stories = random.randint(2, 6)

        for s in range(num_stories):
            title = random.choice(STORY_TITLES)
            theme = random.choice(THEMES)

            # Create story
            story = Story(
                title=title,
                session_id=str(user.id),
            )
            # Backdate creation
            db.add(story)
            db.flush()

            # Create job record
            started = datetime.now() - timedelta(days=random.randint(1, 30))
            completed = started + timedelta(minutes=random.randint(1, 3))
            job = StoryJob(
                job_id=f"demo-{user.id}-{s}-{random.randint(1000, 9999)}",
                session_id=str(user.id),
                theme=theme,
                status="completed",
                story_id=story.id,
                created_at=started,
                completed_at=completed,
            )
            db.add(job)

            # Create story tree
            root, win_node, lose_node = _create_story_tree(db, story)

            # Create 1–3 game sessions per story
            num_sessions = random.randint(1, 3)
            for _ in range(num_sessions):
                # Weighted toward losing (more realistic) with some wins
                is_win = random.random() < 0.35  # 35% win rate
                is_completed = random.random() < 0.85  # 85% of sessions are finished

                if is_completed:
                    final_node_id = win_node.id if is_win else lose_node.id
                    status = GameStatus.Win if is_win else GameStatus.Lost
                    session_started = started + timedelta(minutes=random.randint(5, 60))
                    session_ended = session_started + timedelta(minutes=random.randint(3, 20))
                    game_session = GameSession(
                        user_id=user.id,
                        story_id=story.id,
                        current_node_id=final_node_id,
                        status=status,
                        started_at=session_started,
                        completed_at=session_ended,
                    )
                else:
                    game_session = GameSession(
                        user_id=user.id,
                        story_id=story.id,
                        current_node_id=root.id,
                        status=GameStatus.Inprogress,
                        started_at=started + timedelta(minutes=random.randint(5, 60)),
                    )

                db.add(game_session)

        db.commit()
        wins = sum(
            1 for gs in db.query(GameSession)
            .filter(GameSession.user_id == user.id, GameSession.status == GameStatus.Win)
            .all()
        )
        total = db.query(GameSession).filter(GameSession.user_id == user.id).count()
        print(f"  {user.username}: {total} sessions, {wins} wins")

    print("\n✅ Seed complete.")
    print(f"   Total users:    {db.query(User).count()}")
    print(f"   Total stories:  {db.query(Story).count()}")
    print(f"   Total sessions: {db.query(GameSession).count()}")
    print("\n   All demo accounts use password: Demo@1234")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()