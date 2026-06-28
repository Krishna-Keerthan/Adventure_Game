class TestStoryCreation:
    def test_create_story_unauthenticated(self, client):
        response = client.post("/api/stories/create", json={"theme": "fantasy"})
        assert response.status_code == 401

    def test_create_story_returns_job(self, client, auth_headers):
        response = client.post(
            "/api/stories/create",
            json={"theme": "fantasy"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "job_id" in data
        assert data["status"] == "Pending"

    def test_get_job_status(self, client, auth_headers):
        create_resp = client.post(
            "/api/stories/create",
            json={"theme": "pirate"},
            headers=auth_headers,
        )
        job_id = create_resp.json()["job_id"]

        status_resp = client.get(f"/api/jobs/{job_id}", headers=auth_headers)
        assert status_resp.status_code == 200
        data = status_resp.json()
        assert data["job_id"] == job_id
        assert data["status"] in ["Pending", "processing", "completed", "failed"]

    def test_get_job_not_found(self, client, auth_headers):
        response = client.get(
            "/api/jobs/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_get_job_other_user_denied(self, client, auth_headers, second_auth_headers):
        create_resp = client.post(
            "/api/stories/create",
            json={"theme": "fantasy"},
            headers=auth_headers,
        )
        job_id = create_resp.json()["job_id"]

        response = client.get(f"/api/jobs/{job_id}", headers=second_auth_headers)
        assert response.status_code == 403


class TestCompleteStory:
    def test_get_complete_story(self, client, auth_headers, seeded_story):
        story_id = seeded_story["story_id"]
        response = client.get(
            f"/api/stories/{story_id}/complete",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == story_id
        assert "root_node" in data
        assert "all_nodes" in data
        assert data["root_node"]["is_ending"] is False
        assert len(data["root_node"]["options"]) == 2

    def test_get_complete_story_not_found(self, client, auth_headers):
        response = client.get("/api/stories/99999/complete", headers=auth_headers)
        assert response.status_code == 404

    def test_get_complete_story_other_user_denied(
        self, client, auth_headers, second_auth_headers, seeded_story
    ):
        story_id = seeded_story["story_id"]
        response = client.get(
            f"/api/stories/{story_id}/complete",
            headers=second_auth_headers,
        )
        assert response.status_code == 403

    def test_complete_story_structure(self, client, auth_headers, seeded_story):
        story_id = seeded_story["story_id"]
        response = client.get(
            f"/api/stories/{story_id}/complete",
            headers=auth_headers,
        )
        data = response.json()
        root = data["root_node"]

        # Verify options point to real nodes
        for option in root["options"]:
            assert str(option["node_id"]) in data["all_nodes"]