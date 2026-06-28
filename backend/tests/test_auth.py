import pytest


class TestRegister:
    def test_register_success(self, client):
        response = client.post("/api/auth/register", json={
            "username": "newuser",
            "email": "new@example.com",
            "password": "NewPass1",
        })
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["username"] == "newuser"
        assert data["user"]["email"] == "new@example.com"
        assert "hashed_password" not in data["user"]

    def test_register_duplicate_email(self, client, registered_user):
        response = client.post("/api/auth/register", json={
            "username": "different",
            "email": registered_user["email"],
            "password": "Test1234",
        })
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

    def test_register_duplicate_username(self, client, registered_user):
        response = client.post("/api/auth/register", json={
            "username": registered_user["user"]["username"],
            "email": "unique@example.com",
            "password": "Test1234",
        })
        assert response.status_code == 400
        assert "Username already taken" in response.json()["detail"]

    def test_register_weak_password_too_short(self, client):
        response = client.post("/api/auth/register", json={
            "username": "user1",
            "email": "user1@example.com",
            "password": "Ab1",
        })
        assert response.status_code == 422

    def test_register_weak_password_no_uppercase(self, client):
        response = client.post("/api/auth/register", json={
            "username": "user2",
            "email": "user2@example.com",
            "password": "lowercase1",
        })
        assert response.status_code == 422

    def test_register_weak_password_no_digit(self, client):
        response = client.post("/api/auth/register", json={
            "username": "user3",
            "email": "user3@example.com",
            "password": "NoDigitsHere",
        })
        assert response.status_code == 422

    def test_register_invalid_email(self, client):
        response = client.post("/api/auth/register", json={
            "username": "user4",
            "email": "not-an-email",
            "password": "Valid1Pass",
        })
        assert response.status_code == 422

    def test_register_username_too_short(self, client):
        response = client.post("/api/auth/register", json={
            "username": "ab",
            "email": "ab@example.com",
            "password": "Valid1Pass",
        })
        assert response.status_code == 422


class TestLogin:
    def test_login_success(self, client, registered_user):
        response = client.post("/api/auth/login", json={
            "email": registered_user["email"],
            "password": registered_user["password"],
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, registered_user):
        response = client.post("/api/auth/login", json={
            "email": registered_user["email"],
            "password": "WrongPass1",
        })
        assert response.status_code == 401

    def test_login_nonexistent_email(self, client):
        response = client.post("/api/auth/login", json={
            "email": "ghost@example.com",
            "password": "Test1234",
        })
        assert response.status_code == 401

    def test_login_invalid_email_format(self, client):
        response = client.post("/api/auth/login", json={
            "email": "not-an-email",
            "password": "Test1234",
        })
        assert response.status_code == 422


class TestMe:
    def test_get_me_success(self, client, registered_user, auth_headers):
        response = client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == registered_user["email"]
        assert data["username"] == registered_user["user"]["username"]

    def test_get_me_no_token(self, client):
        response = client.get("/api/auth/me")
        assert response.status_code == 401

    def test_get_me_invalid_token(self, client):
        response = client.get("/api/auth/me", headers={"Authorization": "Bearer invalidtoken"})
        assert response.status_code == 401