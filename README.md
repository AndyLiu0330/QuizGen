# QuizGen

A web app that generates multiple-choice quizzes from uploaded documents. Upload a PDF or PPTX, let AI create questions, take quizzes, get auto-graded, and track your weak topics over time.

## Features

- **Document Upload** — Drag-and-drop PDF/PPTX files (up to 50 MB). Text is automatically extracted and stored for quiz generation.
- **AI Quiz Generation** — Generates multiple-choice questions using OpenAI (GPT-4o). Configure question count (5/10/15/20) and difficulty (easy/medium/hard).
- **Interactive Quiz Taking** — Answer questions one by one with a progress bar and sticky submit button.
- **Auto-Grading** — Instant scoring with percentage and correct/incorrect breakdown per question.
- **Weak Topic Tracking** — Each question is tagged with a topic by the AI. Topics where you score below 50% are highlighted so you know what to review.
- **Quiz History** — Browse all past sessions with best scores and weak topics at a glance.
- **Retake** — Retake a quiz with the same questions (creates a new record to preserve history) or generate a fresh quiz from the same material.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7, Lucide React |
| Backend | Python 3.11+, FastAPI, SQLAlchemy 2.0, SQLite, Alembic |
| File Parsing | markitdown (Microsoft) for PDF/PPTX to text |
| AI | OpenAI API (GPT-4o default) |
| Deployment | Docker Compose |

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- An OpenAI API key

### Setup

1. Clone the repo and copy the environment file:

   ```bash
   cp .env.example .env
   ```

2. Add your OpenAI API key to `.env`:

   ```
   OPENAI_API_KEY=your-api-key-here
   ```

3. Install dependencies:

   ```bash
   # Backend
   cd backend
   uv pip install -r requirements.txt
   uv run alembic upgrade head

   # Frontend
   cd ../frontend
   npm install
   ```

4. Start both servers:

   ```bash
   # Backend (port 8000)
   cd backend
   uv run uvicorn app.main:app --reload

   # Frontend (port 3000)
   cd frontend
   npm run dev
   ```

   The frontend proxies `/api/*` requests to the backend in dev mode.

### Docker

```bash
docker-compose up
```

This starts the backend on port 8000 and frontend on port 3000. Database and uploads are persisted via Docker volumes.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | Your OpenAI API key (required) |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | OpenAI API base URL |
| `OPENAI_MODEL` | `gpt-4o` | Model used for quiz generation |
| `DATABASE_URL` | `sqlite:///db/quizgen.db` | SQLAlchemy database URL |
| `MAX_UPLOAD_SIZE_MB` | `50` | Maximum upload file size in MB |

## API Endpoints

### Materials
- `POST /api/materials/upload` — Upload and parse a document
- `GET /api/materials` — List all materials
- `DELETE /api/materials/:id` — Delete a material and its quizzes

### Sessions
- `POST /api/sessions` — Create a quiz session for a material
- `GET /api/sessions` — List all sessions with best scores and weak topics
- `GET /api/sessions/:id` — Get session details with quiz list

### Quizzes
- `POST /api/quizzes` — Generate a new quiz (calls OpenAI)
- `GET /api/quizzes/:id` — Get quiz (answers hidden until submitted)
- `POST /api/quizzes/:id/submit` — Submit answers and get graded results
- `POST /api/quizzes/:id/retake` — Retake with the same questions

## Project Structure

```
backend/
  app/
    config.py          # Settings from .env
    database.py        # SQLAlchemy setup
    models.py          # Material, Session, Quiz, Question
    schemas.py         # Pydantic schemas
    main.py            # FastAPI app
    routers/           # materials, sessions, quizzes
    services/          # file_parser, quiz_generator, grading
  alembic/             # Database migrations
  tests/

frontend/
  src/
    api.js             # API client
    pages/             # UploadPage, SessionConfigPage, QuizPage, ResultsPage, HistoryPage
    components/        # Layout, FileUpload, MaterialCard, QuizConfigForm, QuestionCard, ScoreSummary, WeakTopics
    index.css          # Tailwind theme + design tokens
```

## Running Tests

```bash
cd backend
uv run pytest
```

## License

This project is licensed under the [MIT License](LICENSE).
