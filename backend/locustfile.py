"""
QuestCraft Load Test
====================
Tests the full user journey under concurrent load.

Run locally:
    uv run locust -f locustfile.py --host=https://your-api.onrender.com

Then open http://localhost:8089 in your browser.

For headless run (CI/screenshot evidence):
    uv run locust -f locustfile.py \
        --host=https://your-api.onrender.com \
        --users=50 --spawn-rate=5 \
        --run-time=2m --headless \
        --html=load_test_report.html
"""
import random
import string
from locust import HttpUser, task, between, events


def random_string(length: int = 8) -> str:
    return "".join(random.choices(string.ascii_lowercase, k=length))


class QuestCraftUser(HttpUser):
    """
    Simulates a real user:
    1. Registers or logs in
    2. Checks the leaderboard (cached — should be fast)
    3. Checks their stats
    4. If they have a session, resumes it
    """

    wait_time = between(1, 3)  # realistic think time between actions

    def on_start(self):
        """Called once per simulated user on startup — register and get token."""
        self.token = None
        self.session_id = None
        self.story_id = None

        username = f"load_{random_string(6)}"
        email = f"{username}@loadtest.com"
        password = "LoadTest1"

        with self.client.post(
            "/api/auth/register",
            json={"username": username, "email": email, "password": password},
            catch_response=True,
        ) as response:
            if response.status_code == 201:
                self.token = response.json().get("access_token")
                response.success()
            else:
                response.failure(f"Registration failed: {response.status_code}")

    def _headers(self) -> dict:
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    @task(3)
    def view_leaderboard(self):
        """High frequency — tests Redis cache hit rate."""
        with self.client.get(
            "/api/stats/leaderboard",
            headers=self._headers(),
            catch_response=True,
            name="/api/stats/leaderboard",
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 401:
                response.failure("Unauthenticated")
            else:
                response.failure(f"Leaderboard failed: {response.status_code}")

    @task(2)
    def view_my_stats(self):
        """Medium frequency — personal stats."""
        if not self.token:
            return
        with self.client.get(
            "/api/stats/me",
            headers=self._headers(),
            catch_response=True,
            name="/api/stats/me",
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Stats failed: {response.status_code}")

    @task(2)
    def list_sessions(self):
        """Medium frequency — dashboard sessions list."""
        if not self.token:
            return
        with self.client.get(
            "/api/sessions/",
            headers=self._headers(),
            catch_response=True,
            name="/api/sessions/",
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Sessions list failed: {response.status_code}")

    @task(1)
    def health_check(self):
        """Low frequency — basic availability check."""
        with self.client.get(
            "/health",
            catch_response=True,
            name="/health",
        ) as response:
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "ok":
                    response.success()
                else:
                    response.failure("Health check returned non-ok status")
            else:
                response.failure(f"Health check failed: {response.status_code}")

    @task(1)
    def create_story_job(self):
        """
        Low frequency — story generation is expensive (calls LLM).
        Rate limited to 3/minute per IP so we test it lightly.
        """
        if not self.token:
            return

        themes = [
            "pirate adventure", "space exploration",
            "medieval fantasy", "cyberpunk heist",
        ]
        with self.client.post(
            "/api/stories/create",
            json={"theme": random.choice(themes)},
            headers=self._headers(),
            catch_response=True,
            name="/api/stories/create",
        ) as response:
            if response.status_code == 200:
                job_id = response.json().get("job_id")
                if job_id:
                    self.last_job_id = job_id
                response.success()
            elif response.status_code == 429:
                # Rate limited — expected and correct behaviour
                response.success()
            else:
                response.failure(f"Story creation failed: {response.status_code}")


class ReadOnlyUser(HttpUser):
    """
    Simulates unauthenticated browsing — just hitting public endpoints.
    Represents people checking the landing or health page.
    """
    wait_time = between(2, 5)
    weight = 1  # fewer of these vs authenticated users

    @task
    def health(self):
        self.client.get("/health", name="/health")