class TestMyStats:
    def test_stats_no_games(self, client, auth_headers):
        response = client.get("/api/stats/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total_games"] == 0
        assert data["wins"] == 0
        assert data["losses"] == 0
        assert data["win_rate"] == 0.0

    def test_stats_after_win(self, client, auth_headers, seeded_story):
        start = client.post(
            "/api/sessions/start",
            json={"story_id": seeded_story["story_id"]},
            headers=auth_headers,
        )
        session_id = start.json()["id"]
        client.post(
            f"/api/sessions/{session_id}/choose",
            json={"option_index": 0},
            headers=auth_headers,
        )

        response = client.get("/api/stats/me", headers=auth_headers)
        data = response.json()
        assert data["total_games"] == 1
        assert data["wins"] == 1
        assert data["losses"] == 0
        assert data["win_rate"] == 100.0

    def test_stats_after_loss(self, client, auth_headers, seeded_story):
        start = client.post(
            "/api/sessions/start",
            json={"story_id": seeded_story["story_id"]},
            headers=auth_headers,
        )
        session_id = start.json()["id"]
        client.post(
            f"/api/sessions/{session_id}/choose",
            json={"option_index": 1},
            headers=auth_headers,
        )

        response = client.get("/api/stats/me", headers=auth_headers)
        data = response.json()
        assert data["total_games"] == 1
        assert data["wins"] == 0
        assert data["losses"] == 1
        assert data["win_rate"] == 0.0

    def test_stats_unauthenticated(self, client):
        response = client.get("/api/stats/me")
        assert response.status_code == 401


class TestLeaderboard:
    def test_leaderboard_returns_list(self, client, auth_headers):
        response = client.get("/api/stats/leaderboard", headers=auth_headers)
        assert response.status_code == 200
        assert "entries" in response.json()

    def test_leaderboard_ordering(self, client, auth_headers, second_auth_headers, seeded_story):
        # User 1 wins
        s1 = client.post(
            "/api/sessions/start",
            json={"story_id": seeded_story["story_id"]},
            headers=auth_headers,
        )
        client.post(
            f"/api/sessions/{s1.json()['id']}/choose",
            json={"option_index": 0},
            headers=auth_headers,
        )

        response = client.get("/api/stats/leaderboard", headers=auth_headers)
        entries = response.json()["entries"]

        # The winning user should be rank 1
        assert entries[0]["rank"] == 1
        assert entries[0]["wins"] >= entries[-1]["wins"]

    def test_leaderboard_unauthenticated(self, client):
        response = client.get("/api/stats/leaderboard")
        assert response.status_code == 401