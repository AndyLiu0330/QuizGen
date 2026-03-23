# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuizGen is a single-user web app for generating quizzes from uploaded documents (PDF/PPTX). Users upload files, AI generates multiple-choice questions, users take quizzes, get auto-graded, and can review/redo quizzes with weak-topic tracking.

## Tech Stack

- **Frontend:** React 19 + Vite, Tailwind CSS v4, React Router v7, Lucide React
- **Backend:** Python 3.11+ with FastAPI, SQLAlchemy ORM, SQLite, Alembic migrations
- **File Parsing:** markitdown (Microsoft) for PDF/PPTX → text
- **AI:** OpenAI API (GPT-4o default) for MCQ generation
- **Deployment:** Docker Compose (backend :8000, frontend :3000)

## Commands

### Frontend
```bash
cd frontend
npm install
npm run dev        # Dev server on port 3000
npm run build      # Production build to dist/
npm run lint       # ESLint
```

### Backend
```bash
cd backend
uv run uvicorn app.main:app --reload    # Dev server on port 8000
uv run pytest                           # Run all tests
uv run pytest tests/test_grading.py     # Run single test file
uv run pytest -k "test_name"            # Run single test by name
uv run alembic upgrade head             # Apply migrations
uv run alembic revision --autogenerate -m "description"  # Create migration
```

### Docker
```bash
docker-compose up          # Both services
docker-compose up backend  # Backend only
```

## Architecture

### Data Model
Material (uploaded file) → 1:N Sessions → 1:N Quizzes → 1:N Questions. Extracted text is stored in DB to avoid re-parsing. Each Question has a `topic` label (AI-generated from source) for weak-topic tracking.

### Backend Structure (`backend/app/`)
- `config.py` — pydantic-settings from `.env`
- `database.py` — SQLAlchemy engine/session/Base
- `models.py` — ORM models (Material, Session, Quiz, Question)
- `schemas.py` — Pydantic request/response schemas
- `routers/` — FastAPI routers: `materials.py`, `sessions.py`, `quizzes.py`
- `services/` — Business logic: `file_parser.py` (markitdown), `quiz_generator.py` (OpenAI), `grading.py` (scoring + weak topics)

### Frontend Structure (`frontend/src/`)
- `api.js` — Fetch wrapper for all API endpoints
- `components/` — Reusable: Layout, FileUpload, MaterialCard, QuizConfigForm, QuestionCard, ScoreSummary, WeakTopics
- `pages/` — Route pages: UploadPage (`/`), SessionConfigPage (`/sessions/:id`), QuizPage (`/quizzes/:id`), ResultsPage (`/quizzes/:id/results`), HistoryPage (`/history`)
- `index.css` — Tailwind imports + design tokens as CSS custom properties

### API Endpoints
- `POST /api/materials/upload` — Upload + parse file
- `GET /api/materials` — List materials
- `DELETE /api/materials/:id` — Delete material + cascade
- `POST /api/sessions` — Create session for a material
- `GET /api/sessions` / `GET /api/sessions/:id` — List / detail
- `POST /api/quizzes` — Generate quiz (calls OpenAI)
- `GET /api/quizzes/:id` — Get quiz (hides answers until submitted)
- `POST /api/quizzes/:id/submit` — Submit answers, auto-grade
- `POST /api/quizzes/:id/retake` — New Quiz record with copied questions

### Key Design Decisions
- Retake creates a **new Quiz record** (preserves history); "new quiz" makes a fresh OpenAI call
- Grading: score = correct/total × 100; weak topics = topics with <50% accuracy
- Vite proxies `/api/*` to backend in dev mode
- Tailwind v4 uses `@theme` directive for design tokens (no separate config file)

## Key Reference Documents

- **PRD:** `PRD.md`
- **Architecture Spec:** `docs/superpowers/specs/2026-03-23-quizgen-architecture-design.md`
- **Implementation Plan:** `docs/superpowers/plans/2026-03-23-quizgen-implementation.md`
- **Design System:** `design-system/MASTER.md` + `design-system/pages/*.md`

## Environment

Copy `.env.example` to `.env`. Key variables: `OPENAI_API_KEY`, `OPENAI_MODEL`, `DATABASE_URL`, `MAX_UPLOAD_SIZE_MB`.

## Conventions

- Always use `uv` to run Python commands (not bare `python` or `pip`)
- File storage: `uploads/` volume, DB: `db/` volume (both in `.gitignore`)
- Worktrees are used for feature branches under `.worktrees/` (gitignored)
