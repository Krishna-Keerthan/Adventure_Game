# 🗡️ AdventureAI — AI-Powered Choose Your Own Adventure

> Generate unique branching stories from any theme. Every path is different. Only one leads to victory.

![Python](https://img.shields.io/badge/Python-3.13-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.138-009688?logo=fastapi)
![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3C3C?logo=langchain&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)
![Coverage](https://codecov.io/gh/Krishna-Keerthan/Adventure_Game/branch/main/graph/badge.svg)

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
| LLM Framework | Langchain | Prompt orchestration, structured output parsing, and LLM abstraction |
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
pnpm install

# Create environment file
cp .env.example .env
# VITE_API_URL=http://localhost:8000/api

# Start dev server
pnpm dev
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

### Backend

* Containerized with Docker
* Deployed on **Render**
* Uses **PostgreSQL** for persistent storage
* Database migrations are applied automatically with **Alembic** during deployment

### Frontend

* Deployed on **Vercel**
* Built with **React + Vite**
* Configured for client-side routing and production API integration

### Environment Variables

#### Backend

| Variable                      | Description               |
| ----------------------------- | ------------------------- |
| `DATABASE_URL`                | PostgreSQL connection URL |
| `SECRET_KEY`                  | JWT signing secret        |
| `GROQ_API_KEY`                | Groq API key              |
| `ALLOWED_ORIGINS`             | Allowed frontend origins  |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT expiration time       |
| `DEBUG`                       | Debug mode                |

#### Frontend

| Variable       | Description          |
| -------------- | -------------------- |
| `VITE_API_URL` | Backend API base URL |

After configuring the required environment variables, deploy the backend to **Render** and the frontend to **Vercel**. The application is production-ready with Docker, automatic database migrations, and CORS configuration.

---

## License

MIT — do whatever you want with it.

---

*Built with FastAPI, React, and Groq. Deployed on Render.*
