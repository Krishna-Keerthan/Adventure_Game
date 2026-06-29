# 🗡️ AdventureAI — AI-Powered Choose Your Own Adventure

> Generate unique branching stories from any theme. Every path is different. Only one leads to victory.

![Python](https://img.shields.io/badge/Python-3.13-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.138-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

---

## What is this?

AdventureAI is a full-stack web application that uses a large language model to generate choose-your-own-adventure stories on demand. You enter a theme — pirate treasure hunt, space exploration, cyberpunk heist — and an AI crafts a complete branching narrative tree with multiple paths and endings. You then navigate the story in real time, making choices that determine whether you win or lose.

Every story is unique. No two playthroughs are the same.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React + Vite Frontend                 │
│         TypeScript · TanStack Query · Zustand           │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS + JWT Bearer
┌────────────────────────▼────────────────────────────────┐
│                   FastAPI Backend                        │
│                                                          │
│  /api/auth      →  Register, Login, Profile             │
│  /api/stories   →  Generate story (background job)      │
│  /api/jobs      →  Poll generation status               │
│  /api/sessions  →  Start, play, resume game             │
│  /api/stats     →  Personal stats + leaderboard         │
└──────────┬──────────────────────┬───────────────────────┘
           │                      │
┌──────────▼──────────┐  ┌───────▼──────────────────────┐
│  PostgreSQL (prod)  │  │   Groq API                   │
│  SQLite     (dev)   │  │   llama-3.3-70b-versatile    │
│                     │  │                              │
│  users              │  │  Generates branching JSON    │
│  stories            │  │  story trees from a theme    │
│  story_nodes        │  │                              │
│  story_jobs         │  └──────────────────────────────┘
│  game_sessions      │
└─────────────────────┘
```

### Story generation flow

```
User submits theme
       │
       ▼
POST /api/stories/create  →  job created, returns job_id
       │
       ▼  (background task)
LLM generates JSON story tree
       │
       ▼
GET /api/jobs/{job_id}  →  poll every 2s until completed
       │
       ▼
POST /api/sessions/start  →  session created, root node returned
       │
       ▼
POST /api/sessions/{id}/choose  →  pick option, get next node
       │
       ▼
Repeat until is_ending = true  →  win or lose screen
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Backend | FastAPI | Async, type-safe, automatic OpenAPI docs |
| LLM | Groq (llama-3.3-70b-versatile) | Fast inference, reliable JSON output |
| Database | SQLite (dev) / PostgreSQL (prod) | Zero config locally, production-grade on Render |
| Auth | JWT + bcrypt | Stateless, secure, industry standard |
| ORM | SQLAlchemy + Alembic | Type-safe queries, versioned migrations |
| Frontend | React 19 + Vite + TypeScript | Fast builds, strong type safety |
| State | Zustand | Lightweight auth state with localStorage persistence |
| Data fetching | TanStack Query + Axios | Auto-polling, caching, request deduplication |
| Forms | React Hook Form + Zod | Schema-validated forms mirroring backend rules |
| Styling | Tailwind CSS + shadcn/ui | Utility-first, accessible components |
| Animation | Motion | Smooth page and game transitions |
| Testing | pytest + TestClient | In-memory SQLite, zero LLM calls in tests |
| Deploy | Docker + Render | One-command setup, free-tier cloud hosting |

---

## Project Structure

```
adventure-game/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # Settings via pydantic-settings
│   │   │   ├── dependencies.py    # get_current_user dependency
│   │   │   ├── models.py          # Pydantic models for LLM output
│   │   │   ├── prompts.py         # LLM prompt templates
│   │   │   ├── security.py        # JWT + bcrypt
│   │   │   └── story_generator.py # LLM chain + JSON parsing
│   │   ├── db/
│   │   │   └── database.py        # Engine, session, Base
│   │   ├── models/
│   │   │   ├── game_session.py    # GameSession + GameStatus enum
│   │   │   ├── job.py             # StoryJob
│   │   │   ├── story.py           # Story + StoryNode
│   │   │   └── user.py            # User
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── game_session.py
│   │   │   ├── jobs.py
│   │   │   ├── stats.py
│   │   │   └── stories.py
│   │   └── schemas/
│   │       ├── game_session.py
│   │       ├── job.py
│   │       ├── stats.py
│   │       ├── story.py
│   │       └── user.py
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_game_session.py
│   │   ├── test_stats.py
│   │   └── test_stories.py
│   ├── migrations/
│   ├── .env.example
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── main.py
│   └── pyproject.toml
└── frontend/
    ├── src/
    │   ├── api/          # Axios call functions per resource
    │   ├── components/
    │   │   ├── game/     # StoryNode, OptionCard, GameEndScreen
    │   │   └── layout/   # Navbar, ProtectedRoute, PageWrapper
    │   ├── hooks/        # TanStack Query hooks per endpoint
    │   ├── lib/          # Axios instance, Zod schemas, utils
    │   ├── pages/        # Landing, Login, Register, Dashboard,
    │   │                 # Generate, Play, Leaderboard
    │   ├── store/        # Zustand auth store
    │   └── types/        # TypeScript interfaces
    ├── .env.example
    └── package.json
```

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register, returns JWT |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Current user profile |

### Stories
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/stories/create` | ✅ | Queue story generation |
| GET | `/api/stories/{id}/complete` | ✅ | Full story tree |

### Jobs
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/jobs/{job_id}` | ✅ | Poll generation status |

### Game Sessions
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/sessions/start` | ✅ | Start or resume session |
| POST | `/api/sessions/{id}/choose` | ✅ | Choose an option |
| GET | `/api/sessions/{id}` | ✅ | Get session state |
| GET | `/api/sessions/` | ✅ | List all your sessions |

### Stats
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/stats/me` | ✅ | Your win/loss stats |
| GET | `/api/stats/leaderboard` | ✅ | Global rankings |

Interactive API docs: `http://localhost:8000/docs`

---

## Local Development

### Prerequisites

- Python 3.13+
- [uv](https://github.com/astral-sh/uv) (`pip install uv`)
- Node.js 20+
- A [Groq API key](https://console.groq.com) (free)

### Backend

```bash
cd backend

# Install dependencies
uv sync

# Create environment file
cp .env.example .env
# Edit .env — fill in SECRET_KEY and GROQ_API_KEY

# Run database migrations
uv run alembic upgrade head

# Start the server
uv run main.py
```

API available at `http://localhost:8000`
Docs available at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# VITE_API_URL=http://localhost:8000/api

# Start dev server
npm run dev
```

App available at `http://localhost:5173`

### Docker (backend + database together)

```bash
cd backend
docker-compose up --build
```

This starts FastAPI on port 8000 and PostgreSQL on port 5432.

### Running tests

```bash
cd backend
uv run python -m pytest tests/ -v

# With coverage report
uv run python -m pytest tests/ -v --cov=app --cov-report=term-missing
```

Tests use an in-memory SQLite database and never call the Groq API.
All 48 tests pass on a clean checkout.

---

## Deployment

### Deploy Backend to Render

#### Step 1 — Push your code to GitHub

Make sure your repository has the `backend/` folder with `Dockerfile` and `docker-compose.yml` committed.

#### Step 2 — Create a PostgreSQL database on Render

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Fill in:
   - **Name:** `adventure-game-db`
   - **Region:** Choose closest to your users
   - **Plan:** Free (expires after 90 days) or Starter for production
4. Click **Create Database**
5. Once created, copy the **Internal Database URL** — you'll need it in Step 4

#### Step 3 — Create a Web Service on Render

1. Click **New +** → **Web Service**
2. Connect your GitHub account and select your repository
3. Configure:
   - **Name:** `adventure-game-api`
   - **Region:** Same as your database
   - **Root Directory:** `backend`
   - **Environment:** `Docker`
   - **Branch:** `main`
4. Click **Create Web Service** — Render will detect the `Dockerfile` automatically

#### Step 4 — Set environment variables

In your Web Service dashboard → **Environment** tab, add:

```
DATABASE_URL        = <Internal Database URL from Step 2>
SECRET_KEY          = <generate a random 32+ character string>
ALGORITHM           = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 10080
GROQ_API_KEY        = <your Groq API key>
ALLOWED_ORIGINS     = https://your-frontend-domain.onrender.com
DEBUG               = False
```

To generate a secure `SECRET_KEY`:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

#### Step 5 — Deploy

Click **Deploy Latest Commit**. Render will:
1. Build the Docker image
2. Run `alembic upgrade head` automatically (from the Dockerfile CMD)
3. Start the FastAPI server

Your API will be live at `https://adventure-game-api.onrender.com`
Docs at `https://adventure-game-api.onrender.com/docs`

---

### Deploy Frontend to Render

#### Step 1 — Update the environment variable

In your frontend `.env.production` (or set during build):
```
VITE_API_URL=https://adventure-game-api.onrender.com/api
```

#### Step 2 — Create a Static Site on Render

1. Click **New +** → **Static Site**
2. Connect your repository
3. Configure:
   - **Name:** `adventure-game-frontend`
   - **Root Directory:** `frontend`
   - **Branch:** `main`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Under **Environment Variables**, add:
   ```
   VITE_API_URL = https://adventure-game-api.onrender.com/api
   ```
5. Add a **Rewrite Rule** for React Router (single-page app):
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** Rewrite

   This is critical — without it, refreshing any page other than `/` will return a 404.

6. Click **Create Static Site**

Your frontend will be live at `https://adventure-game-frontend.onrender.com`

#### Step 3 — Update CORS on the backend

Go back to your backend Web Service → **Environment** and update:
```
ALLOWED_ORIGINS = https://adventure-game-frontend.onrender.com
```

Then click **Save** — Render will redeploy automatically.

---

### Post-deployment checklist

- [ ] `GET https://your-api.onrender.com/health` returns `{"status": "ok"}`
- [ ] `GET https://your-api.onrender.com/docs` loads Swagger UI
- [ ] Register a new account on the frontend
- [ ] Generate a story and play through it
- [ ] Check the leaderboard populates after finishing a game

---

## Environment Variables Reference

### Backend (`.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | SQLite path or PostgreSQL URL |
| `SECRET_KEY` | ✅ | — | JWT signing secret (min 32 chars) |
| `GROQ_API_KEY` | ✅ | — | Groq API key |
| `ALGORITHM` | ❌ | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | `10080` | Token lifetime (7 days) |
| `ALLOWED_ORIGINS` | ❌ | `""` | Comma-separated CORS origins |
| `DEBUG` | ❌ | `False` | Debug mode |

### Frontend (`.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Backend API base URL |

---

## License

MIT — do whatever you want with it.

---

*Built with FastAPI, React, and Groq. Deployed on Render.*