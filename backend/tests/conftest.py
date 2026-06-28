import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
import app.db.database as db_module  # 👈 import the module itself
import app.routers.story as stories_module  # 👈 to patch SessionLocal inside it
from main import app

TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    # Override FastAPI dependency
    app.dependency_overrides[get_db] = override_get_db

    # Patch SessionLocal used directly in background tasks
    original_session_local = stories_module.SessionLocal
    stories_module.SessionLocal = TestingSessionLocal  # 👈 critical fix

    with TestClient(app, raise_server_exceptions=True) as c:
        yield c

    # Restore everything
    app.dependency_overrides.clear()
    stories_module.SessionLocal = original_session_local  # 👈 restore after test


@pytest.fixture
def registered_user(client):
    payload = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test1234",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    return {
        "token": data["access_token"],
        "user": data["user"],
        "password": payload["password"],
        "email": payload["email"],
    }


@pytest.fixture
def auth_headers(registered_user):
    return {"Authorization": f"Bearer {registered_user['token']}"}


@pytest.fixture
def second_user(client):
    payload = {
        "username": "otheruser",
        "email": "other@example.com",
        "password": "Other1234",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    return {
        "token": data["access_token"],
        "user": data["user"],
    }


@pytest.fixture
def second_auth_headers(second_user):
    return {"Authorization": f"Bearer {second_user['token']}"}


@pytest.fixture
def seeded_story(client, registered_user, db):
    from app.models.story import Story, StoryNode

    user_id = registered_user["user"]["id"]

    story = Story(title="Test Adventure", session_id=str(user_id))
    db.add(story)
    db.flush()

    root = StoryNode(
        story_id=story.id,
        content="You stand at a crossroads.",
        is_root=True,
        is_ending=False,
        is_winning_ending=False,
        options=[],
    )
    db.add(root)
    db.flush()

    win_node = StoryNode(
        story_id=story.id,
        content="You find the treasure!",
        is_root=False,
        is_ending=True,
        is_winning_ending=True,
        options=[],
    )
    lose_node = StoryNode(
        story_id=story.id,
        content="You fall into a trap.",
        is_root=False,
        is_ending=True,
        is_winning_ending=False,
        options=[],
    )
    db.add(win_node)
    db.add(lose_node)
    db.flush()

    root.options = [
        {"text": "Go left", "node_id": win_node.id},
        {"text": "Go right", "node_id": lose_node.id},
    ]
    db.commit()
    db.expire_all()

    return {
        "story_id": story.id,
        "root_node_id": root.id,
        "win_node_id": win_node.id,
        "lose_node_id": lose_node.id,
    }