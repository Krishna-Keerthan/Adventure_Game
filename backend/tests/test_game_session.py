import pytest
from app.models.game_session import GameStatus
class TestStartSession:
    def test_start_session_success(self, client, auth_headers, seeded_story):
        response = client.post(
            "/api/sessions/start",
            json={"story_id": seeded_story["story_id"]},
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == GameStatus.Inprogress
        assert data["current_node"]["node_id"] == seeded_story["root_node_id"]
        assert len(data["current_node"]["options"]) == 2

    def test_start_session_story_not_found(self, client, auth_headers):
        response = client.post(
            "/api/sessions/start",
            json={"story_id": 99999},
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_start_session_other_user_story_denied(
        self, client, second_auth_headers, seeded_story
    ):
        response = client.post(
            "/api/sessions/start",
            json={"story_id": seeded_story["story_id"]},
            headers=second_auth_headers,
        )
        assert response.status_code == 201

    def test_start_session_returns_existing_if_in_progress(
        self, client, auth_headers, seeded_story
    ):
        r1 = client.post(
            "/api/sessions/start",
            json={"story_id": seeded_story["story_id"]},
            headers=auth_headers,
        )
        r2 = client.post(
            "/api/sessions/start",
            json={"story_id": seeded_story["story_id"]},
            headers=auth_headers,
        )
        assert r1.json()["id"] == r2.json()["id"]

    def test_start_session_unauthenticated(self, client, seeded_story):
        response = client.post(
            "/api/sessions/start",
            json={"story_id": seeded_story["story_id"]},
        )
        assert response.status_code == 401


class TestChooseOption:
    @pytest.fixture
    def active_session(self, client, auth_headers, seeded_story):
        response = client.post(
            "/api/sessions/start",
            json={"story_id": seeded_story["story_id"]},
            headers=auth_headers,
        )
        return response.json()

    def test_choose_winning_option(self, client, auth_headers, active_session):
        response = client.post(
            f"/api/sessions/{active_session['id']}/choose",
            json={"option_index": 0},  # index 0 = win node
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == GameStatus.Win
        assert data["current_node"]["is_ending"] is True
        assert data["current_node"]["is_winning_ending"] is True
        assert data["current_node"]["options"] == []

    def test_choose_losing_option(self, client, auth_headers, active_session):
        response = client.post(
            f"/api/sessions/{active_session['id']}/choose",
            json={"option_index": 1},  # index 1 = lose node
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == GameStatus.Lost
        assert data["current_node"]["is_winning_ending"] is False

    def test_choose_invalid_option_index(self, client, auth_headers, active_session):
        response = client.post(
            f"/api/sessions/{active_session['id']}/choose",
            json={"option_index": 99},
            headers=auth_headers,
        )
        assert response.status_code == 400

    def test_choose_negative_option_index(self, client, auth_headers, active_session):
        response = client.post(
            f"/api/sessions/{active_session['id']}/choose",
            json={"option_index": -1},
            headers=auth_headers,
        )
        assert response.status_code == 400

    def test_choose_on_completed_session(self, client, auth_headers, active_session):
        # End the session first
        client.post(
            f"/api/sessions/{active_session['id']}/choose",
            json={"option_index": 0},
            headers=auth_headers,
        )
        # Try to choose again
        response = client.post(
            f"/api/sessions/{active_session['id']}/choose",
            json={"option_index": 0},
            headers=auth_headers,
        )
        assert response.status_code == 400
        assert "already completed" in response.json()["detail"]

    def test_choose_other_user_session_denied(
        self, client, auth_headers, second_auth_headers, active_session
    ):
        response = client.post(
            f"/api/sessions/{active_session['id']}/choose",
            json={"option_index": 0},
            headers=second_auth_headers,
        )
        assert response.status_code == 403


class TestGetSession:
    def test_get_session_success(self, client, auth_headers, seeded_story):
        start = client.post(
            "/api/sessions/start",
            json={"story_id": seeded_story["story_id"]},
            headers=auth_headers,
        )
        session_id = start.json()["id"]

        response = client.get(f"/api/sessions/{session_id}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["id"] == session_id

    def test_get_session_not_found(self, client, auth_headers):
        response = client.get("/api/sessions/99999", headers=auth_headers)
        assert response.status_code == 404

    def test_get_session_other_user_denied(
        self, client, auth_headers, second_auth_headers, seeded_story
    ):
        start = client.post(
            "/api/sessions/start",
            json={"story_id": seeded_story["story_id"]},
            headers=auth_headers,
        )
        session_id = start.json()["id"]

        response = client.get(f"/api/sessions/{session_id}", headers=second_auth_headers)
        assert response.status_code == 403


class TestListSessions:
    def test_list_sessions_empty(self, client, auth_headers):
        response = client.get("/api/sessions/", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == []

    def test_list_sessions_returns_own_only(
        self, client, auth_headers, second_auth_headers, seeded_story
    ):
        client.post(
            "/api/sessions/start",
            json={"story_id": seeded_story["story_id"]},
            headers=auth_headers,
        )
        response = client.get("/api/sessions/", headers=second_auth_headers)
        assert response.json() == []

    def test_list_sessions_contains_started(self, client, auth_headers, seeded_story, db):
        resp = client.post(
            "/api/sessions/start",
            json={"story_id": seeded_story["story_id"]},
            headers=auth_headers,
        )
        assert resp.status_code == 201
        db.expire_all()
        response = client.get("/api/sessions/", headers=auth_headers)
        assert len(response.json()) == 1
        assert response.json()[0]["status"] == GameStatus.Inprogress