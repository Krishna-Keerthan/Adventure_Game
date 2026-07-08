<div align="center">

# ⚔️ QuestCraft

### AI-Powered Choose Your Own Adventure

[![Live Demo](https://img.shields.io/badge/Live%20Demo-adventure--game--pearl.vercel.app-gold?style=for-the-badge&logo=vercel)](https://adventure-game-pearl.vercel.app/)
[![Backend](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://adventure-game-api-5rhm.onrender.com/docs)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.138-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

*Enter a theme. An ancient intelligence weaves your story. Every choice echoes through the ages.*

**[▶ Play Now](https://adventure-game-pearl.vercel.app/) · [API Docs](https://adventure-game-api-5rhm.onrender.com/docs) · [Report Bug](https://github.com/Krishna-Keerthan/Adventure_Game/issues)**

</div>

---

## 📸 Preview

> **Landing Page — Dark Fantasy Theme**

![QuestCraft Landing Page](docs/screenshots/landing.png)

> *QuestCraft features a dark fantasy aesthetic with gold accents, Cinzel typography, and a fully responsive light/dark mode that persists across sessions.*

---

## ✨ What Is This?

QuestCraft is a full-stack AI-powered game where every adventure is uniquely generated from a theme you choose. The LLM crafts a complete branching narrative tree — multiple paths, multiple endings, only one leads to victory. You navigate the story in real time, making choices that shape your fate.

**No two playthroughs are ever the same.**

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  React + Vite Frontend                        │
│        TypeScript · TanStack Query · Zustand · Motion        │
│              Deployed on Vercel (Global CDN)                  │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTPS + JWT Bearer
┌─────────────────────────▼────────────────────────────────────┐
│                    FastAPI Backend                            │
│                                                               │
│  /api/auth       →  Register, Login, Profile                 │
│  /api/stories    →  Generate story (async background job)    │
│  /api/jobs       →  Poll generation status                   │
│  /api/sessions   →  Start, play, resume game                 │
│  /api/stats      →  Personal stats + paginated leaderboard   │
│                                                               │
│              Deployed on Render (Docker)                      │
└──────────┬────────────────────────┬─────────────────────────┘
           │                        │
┌──────────▼──────────┐   ┌────────▼──────────────────────────┐
│  PostgreSQL          │   │  Groq API                         │
│  (Render Managed)    │   │  llama-3.3-70b-versatile          │
│                      │   │                                   │
│  users               │   │  Generates branching JSON         │
│  stories             │   │  story trees from a theme         │
│  story_nodes         │   │  with multiple endings            │
│  story_jobs          │   └───────────────────────────────────┘
│  game_sessions       │
└──────────────────────┘
           │
┌──────────▼──────────┐
│  Upstash Redis       │
│  (Serverless Cache)  │
│                      │
│  Leaderboard cache   │
│  5 min TTL           │
│  Auto-invalidation   │
└──────────────────────┘
```

### Story Generation Flow

```
1. User submits theme
         │
         ▼
2. POST /api/stories/create  →  background job created, returns job_id
         │
         ▼  (FastAPI BackgroundTask)
3. LLM generates JSON story tree (3–4 levels deep, 2–3 options per node)
         │
         ▼
4. GET /api/jobs/{job_id}  →  frontend polls every 2s until "completed"
         │
         ▼
5. POST /api/sessions/start  →  game session created, root node returned
         │
         ▼
6. POST /api/sessions/{id}/choose  →  pick option, receive next node
         │
         ▼
7. Repeat until is_ending = true  →  Victory or Defeat screen
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| FastAPI | 0.138 | Async REST API framework |
| SQLAlchemy | 2.0 | ORM with type-safe queries |
| Alembic | 1.18 | Database migration management |
| PostgreSQL | 15 | Production database |
| SQLite | — | Development database |
| LangChain + Groq | — | LLM orchestration |
| llama-3.3-70b-versatile | — | Story generation model |
| Redis (Upstash) | — | Leaderboard caching |
| JWT + bcrypt | — | Authentication |
| Sentry | — | Error tracking |
| slowapi | — | Rate limiting |
| Locust | — | Load testing |
| pytest | — | Test suite (48 tests) |
| Docker | — | Containerization |
| uv | — | Package management |

### Frontend

| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework with fast builds |
| TypeScript | Type safety across the stack |
| TanStack Query | Server state, caching, polling |
| Zustand + persist | Auth state + theme persistence |
| React Hook Form + Zod | Schema-validated forms |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Accessible component primitives |
| Motion | Page and game animations |
| Axios | HTTP client with JWT interceptor |
| Lucide React | Icon system |

---

## 📁 Project Structure

```
adventure-game/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── cache.py           # Redis client with graceful fallback
│   │   │   ├── config.py          # Pydantic settings
│   │   │   ├── dependencies.py    # get_current_user dependency
│   │   │   ├── models.py          # Pydantic models for LLM output
│   │   │   ├── prompts.py         # LLM prompt templates
│   │   │   ├── security.py        # JWT + bcrypt + SHA-256
│   │   │   └── story_generator.py # LangChain chain + JSON repair
│   │   ├── db/
│   │   │   └── database.py        # Engine, session, connection pooling
│   │   ├── models/
│   │   │   ├── game_session.py    # GameSession + GameStatus enum
│   │   │   ├── job.py             # StoryJob
│   │   │   ├── story.py           # Story + StoryNode
│   │   │   └── user.py            # User
│   │   ├── routers/
│   │   │   ├── auth.py            # Register, login, me
│   │   │   ├── game_session.py    # Start, choose, resume, list
│   │   │   ├── jobs.py            # Job status polling
│   │   │   ├── stats.py           # Paginated leaderboard + user rank
│   │   │   └── stories.py        # Story generation + retrieval
│   │   └── schemas/
│   │       ├── game_session.py
│   │       ├── job.py
│   │       ├── stats.py           # Paginated leaderboard schemas
│   │       ├── story.py
│   │       └── user.py
│   ├── migrations/                # Alembic migration history
│   ├── scripts/
│   │   └── seed_data.py           # 50 demo users with game history
│   ├── tests/
│   │   ├── conftest.py            # In-memory SQLite fixtures
│   │   ├── test_auth.py           # 15 auth tests
│   │   ├── test_game_session.py   # 18 game session tests
│   │   ├── test_stats.py          # 8 stats tests
│   │   └── test_stories.py        # 7 story tests
│   ├── .env.example
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── locustfile.py              # Load testing
│   ├── main.py
│   └── pyproject.toml
└── frontend/
    ├── src/
    │   ├── api/                   # Axios call functions
    │   ├── components/
    │   │   ├── game/              # StoryNode, OptionCard, GameEndScreen
    │   │   │                        TypewriterText
    │   │   └── layout/            # Navbar, ProtectedRoute, ThemeToggle
    │   ├── hooks/                 # TanStack Query hooks
    │   ├── lib/                   # Axios instance, Zod schemas, utils
    │   ├── pages/                 # Landing, Login, Register, Dashboard,
    │   │                            Generate, Play, Leaderboard
    │   ├── store/                 # Zustand auth + theme stores
    │   └── types/                 # TypeScript interfaces
    ├── .env.example
    └── package.json
```

---

## 🚀 Local Development

### Prerequisites

- Python 3.13+
- [uv](https://github.com/astral-sh/uv) — `pip install uv`
- Node.js 20+
- A [Groq API key](https://console.groq.com) (free)
- A [Upstash](https://upstash.com) Redis database (free)

### Backend

```bash
cd backend

# Install dependencies
uv sync

# Configure environment
cp .env.example .env
# Edit .env — fill in SECRET_KEY, GROQ_API_KEY, UPSTASH_REDIS_URL

# Run migrations
uv run alembic upgrade head

# Seed demo data (optional)
uv run python scripts/seed_data.py

# Start server
uv run main.py
```

API: `http://localhost:8000`
Docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Set: VITE_API_URL=http://localhost:8000/api

# Start dev server
npm run dev
```

App: `http://localhost:5173`

### Docker (full stack locally)

```bash
cd backend
docker-compose up --build
```

Starts FastAPI on `:8000` and PostgreSQL on `:5432`.

---

## 🧪 Testing

```bash
cd backend

# Run full test suite
uv run python -m pytest tests/ -v

# With coverage report
uv run python -m pytest tests/ -v --cov=app --cov-report=term-missing
```

**48 tests — all passing.** Tests use in-memory SQLite and never call the Groq API or Redis.

```
tests/test_auth.py          15 passed
tests/test_game_session.py  18 passed
tests/test_stats.py          8 passed
tests/test_stories.py        7 passed
```

---

## 📊 Load Testing

Tested with [Locust](https://locust.io) — 50 concurrent users, 5 users/second spawn rate against production.

```bash
cd backend
uv run locust -f locustfile.py \
  --host=https://adventure-game-api-5rhm.onrender.com \
  --users=50 --spawn-rate=5 \
  --run-time=2m --headless \
  --html=load_test_report.html
```

| Endpoint | Median | 95th Percentile | RPS |
|---|---|---|---|
| `GET /health` | 310ms | 750ms | 4.68 |
| `GET /api/stats/leaderboard` | 310ms | 380ms | 2.01 |

**Leaderboard served at 310ms median with Redis cache active.**
Cold start spikes on Render free tier are eliminated via UptimeRobot keep-alive pinging every 5 minutes.

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register — returns JWT |
| `POST` | `/api/auth/login` | ❌ | Login — returns JWT |
| `GET` | `/api/auth/me` | ✅ | Current user profile |

### Stories
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/stories/create` | ✅ | Queue LLM story generation |
| `GET` | `/api/stories/{id}/complete` | ✅ | Full story node tree |

### Jobs
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/jobs/{job_id}` | ✅ | Poll generation status |

### Game Sessions
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/sessions/start` | ✅ | Start or resume a session |
| `POST` | `/api/sessions/{id}/choose` | ✅ | Choose an option |
| `GET` | `/api/sessions/{id}` | ✅ | Get session state |
| `GET` | `/api/sessions/` | ✅ | List all sessions |

### Stats
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/stats/me` | ✅ | Personal win/loss stats |
| `GET` | `/api/stats/me/rank` | ✅ | Current user rank + percentile |
| `GET` | `/api/stats/leaderboard` | ✅ | Paginated leaderboard with tier filter |

#### Leaderboard query parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | `int` | `1` | Page number (10 per page) |
| `tier` | `int` | `null` | Filter to top N: 5, 10, 30, 50, 100, 250, 500, 1000 |

Interactive docs: `https://adventure-game-api-5rhm.onrender.com/docs`

---

## 🌍 Deployment

### Backend → Render

#### 1. Create PostgreSQL on Render
- Render Dashboard → **New +** → **PostgreSQL**
- Name: `questcraft-db` · Plan: Free
- Copy the **Internal Database URL**

#### 2. Create Web Service on Render
- **New +** → **Web Service**
- Connect your GitHub repo
- Root Directory: `backend`
- Environment: **Docker**
- Branch: `main`

#### 3. Environment Variables
```env
DATABASE_URL                = <Internal PostgreSQL URL>
SECRET_KEY                  = <32+ char random string>
ALGORITHM                   = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 10080
GROQ_API_KEY                = <your Groq key>
UPSTASH_REDIS_URL           = rediss://default:xxx@xxx.upstash.io:6379
ALLOWED_ORIGINS             = https://adventure-game-pearl.vercel.app
SENTRY_DSN                  = <optional>
DEBUG                       = False
```

Generate a secure secret key:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

#### 4. Deploy
Render builds the Docker image, runs `alembic upgrade head`, and starts the server automatically.

---

### Frontend → Vercel

#### 1. Import project
- [vercel.com](https://vercel.com) → **Add New Project**
- Connect your GitHub repo
- Root Directory: `frontend`
- Framework: **Vite**

#### 2. Environment Variables
```env
VITE_API_URL = https://adventure-game-api-5rhm.onrender.com/api
```

#### 3. Rewrite rule for React Router
Create `frontend/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### 4. Deploy
Vercel auto-deploys on every push to `main`.

---

### Keep Render Warm (Free Tier)

Render's free tier spins down after 15 minutes of inactivity causing 30–60 second cold starts.

**Fix with [UptimeRobot](https://uptimerobot.com) (free):**
- Monitor Type: `HTTP(s)`
- URL: `https://adventure-game-api-5rhm.onrender.com/health`
- Interval: Every 5 minutes

---

## 🔑 Environment Variables Reference

### Backend

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | SQLite path or PostgreSQL URL |
| `SECRET_KEY` | ✅ | — | JWT signing secret (min 32 chars) |
| `GROQ_API_KEY` | ✅ | — | Groq API key |
| `UPSTASH_REDIS_URL` | ✅ | — | Redis URL (`rediss://` for TLS) |
| `ALGORITHM` | ❌ | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | `10080` | Token lifetime (7 days) |
| `ALLOWED_ORIGINS` | ❌ | `""` | Comma-separated CORS origins |
| `SENTRY_DSN` | ❌ | `None` | Sentry error tracking DSN |
| `DEBUG` | ❌ | `False` | Debug mode |

### Frontend

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Backend API base URL |

---

## 🎮 Features

- **AI Story Generation** — LLM generates unique branching narratives from any theme
- **Async Job System** — Non-blocking generation with real-time polling
- **Game Session State** — Resume adventures across sessions and devices
- **JWT Authentication** — Secure register/login with bcrypt password hashing
- **Paginated Leaderboard** — Redis-cached, tier-filtered rankings (Top 5 → Top 1000)
- **Sticky User Rank** — Always see your rank and percentile on the leaderboard
- **Personal Stats** — Win/loss tracking with win rate
- **Dark/Light Theme** — Dark fantasy and parchment modes, persisted in localStorage
- **Typewriter Effect** — Story text appears character by character for immersion
- **Responsive Design** — Mobile-first, works on all screen sizes
- **Rate Limiting** — 3 story generations per minute per IP
- **Error Tracking** — Sentry integration for production observability

---

## 🔒 Security

- Passwords hashed with bcrypt (SHA-256 pre-hash eliminates 72-byte limit)
- JWT tokens with configurable expiry
- CORS restricted to known frontend origins
- Rate limiting on LLM endpoints via slowapi
- Ownership checks on all game session and story endpoints
- Environment secrets never committed to version control

---

## 📜 License

MIT — do whatever you want with it.

---

<div align="center">

Built with FastAPI, React, Groq, and Redis.
Deployed on Render and Vercel.

**[▶ Play QuestCraft](https://adventure-game-pearl.vercel.app/)**

</div>