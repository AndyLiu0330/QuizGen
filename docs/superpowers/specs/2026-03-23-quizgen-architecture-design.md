# QuizGen Architecture Design

## Overview

QuizGen is a single-user web application for generating quizzes from uploaded documents. Users upload PDF or PPTX files, the system parses them and uses OpenAI to generate multiple-choice questions. Users take quizzes, get auto-graded, and can review history or redo quizzes.

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Python FastAPI
- **Database:** SQLite (via SQLAlchemy + Alembic)
- **File Parsing:** markitdown (Microsoft)
- **AI:** OpenAI API (GPT-4o default)
- **Deployment:** Docker Compose (2 services: frontend, backend)

## Data Model

### Material

Represents an uploaded file.

| Field           | Type     | Notes                        |
|-----------------|----------|------------------------------|
| id              | int (PK) | Auto-increment               |
| file_name       | string   | Original file name           |
| file_type       | string   | "pdf" or "pptx"              |
| file_size       | int      | Bytes                        |
| upload_date     | datetime | UTC                          |
| extracted_text  | text     | Parsed content from markitdown |

Files stored on disk in `uploads/` volume.

### Session

A collection of quizzes from the same material.

| Field        | Type     | Notes              |
|--------------|----------|--------------------|
| id           | int (PK) | Auto-increment     |
| name         | string   | Auto-generated or user-provided |
| created_at   | datetime | UTC                |
| material_id  | int (FK) | References Material |

### Quiz

One quiz attempt within a session.

| Field          | Type     | Notes                          |
|----------------|----------|--------------------------------|
| id             | int (PK) | Auto-increment                 |
| session_id     | int (FK) | References Session             |
| num_questions  | int      | Number of questions configured |
| difficulty     | string   | "easy", "medium", or "hard"    |
| score          | float    | Nullable, set after grading    |
| created_at     | datetime | UTC                            |
| completed_at   | datetime | Nullable, set after submission |

### Question

A single multiple-choice question belonging to a quiz.

| Field          | Type     | Notes                            |
|----------------|----------|----------------------------------|
| id             | int (PK) | Auto-increment                   |
| quiz_id        | int (FK) | References Quiz                  |
| question_text  | string   | The question                     |
| choices        | JSON     | Array of 4 option strings        |
| correct_answer | int      | Index (0-3) of correct choice    |
| user_answer    | int      | Nullable, index of user's choice |

### Relationships

- Material 1 → N Sessions
- Session 1 → N Quizzes
- Quiz 1 → N Questions

## API Endpoints

### Materials

| Method | Endpoint                  | Description                                      |
|--------|---------------------------|--------------------------------------------------|
| POST   | /api/materials/upload     | Upload file, parse with markitdown, store text   |
| GET    | /api/materials            | List all uploaded materials                      |
| DELETE | /api/materials/:id        | Delete material and all associated data          |

### Sessions

| Method | Endpoint             | Description                              |
|--------|----------------------|------------------------------------------|
| POST   | /api/sessions        | Create session for a material            |
| GET    | /api/sessions        | List all sessions with scores and stats  |
| GET    | /api/sessions/:id    | Get session detail with its quizzes      |

### Quizzes

| Method | Endpoint                  | Description                                          |
|--------|---------------------------|------------------------------------------------------|
| POST   | /api/quizzes              | Generate quiz (params: session_id, num_questions, difficulty). Calls OpenAI. |
| GET    | /api/quizzes/:id          | Get quiz with questions (hides correct answers until submitted) |
| POST   | /api/quizzes/:id/submit   | Submit answers, auto-grade, return score             |

### User Flow

1. Upload file → Material created, text extracted
2. Create a Session for that material
3. Configure and generate a Quiz (num_questions, difficulty)
4. Answer questions and submit → auto-graded
5. Redo by creating a new Quiz in the same Session

## Backend Services

### FileParserService

- Uses markitdown to convert PDF/PPTX to markdown text
- Saves uploaded file to `uploads/` volume
- Stores extracted text in the database
- Validates file type (pdf, pptx only) and size (max 50MB)

### QuizGeneratorService

- Takes extracted text, num_questions, and difficulty level
- Sends structured prompt to OpenAI API requesting MCQs in JSON format
- Difficulty guidance: easy = recall, medium = understanding, hard = application/analysis
- Parses and validates OpenAI response, stores questions in DB
- Questions generated at quiz creation time (not on the fly)

### GradingService

- Compares user_answer index against correct_answer index for each question
- Calculates score as percentage
- Updates Quiz record with score and completed_at timestamp

### Key Decisions

- Extracted text is stored in DB to avoid re-parsing on every quiz generation
- Redo generates fresh questions via a new OpenAI call (prevents memorization)
- OpenAI response is validated for correct JSON structure before storing

## Frontend Pages

### 1. Upload Page (`/`)

- Drag-and-drop or click to upload PDF/PPTX files
- Displays list of uploaded materials (name, type, size, date)
- Click a material to create or view sessions

### 2. Session Config Page (`/sessions/:id`)

- Shows material info
- Form to configure a new quiz:
  - Number of questions: 5, 10, 15, or 20
  - Difficulty: easy, medium, or hard
- Button to generate quiz
- Lists previous quizzes in this session with scores

### 3. Quiz Page (`/quizzes/:id`)

- Displays all questions as a scrollable list
- Each question shows question text and 4 radio button choices
- Submit button at the bottom
- Loading state while AI generates the quiz

### 4. Results Page (`/quizzes/:id/results`)

- Shows score (e.g., 8/10 — 80%)
- Lists each question with user's answer vs correct answer (green/red highlighting)
- Button to redo (creates new quiz in same session)
- Button to go back to session

### Navigation

- Simple top bar with link back to home (upload page)
- Session history accessible from each material's page

## Docker Compose

```yaml
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    volumes:
      - ./uploads:/app/uploads
      - ./db:/app/db
    env_file: .env

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [backend]
```

## Configuration (.env)

| Variable            | Default                    | Description          |
|---------------------|----------------------------|----------------------|
| OPENAI_API_KEY      | (required)                 | OpenAI API key       |
| OPENAI_MODEL        | gpt-4o                     | Model for generation |
| DATABASE_URL        | sqlite:///db/quizgen.db    | SQLite path          |
| MAX_UPLOAD_SIZE_MB  | 50                         | Max upload size      |

## Infrastructure Notes

- SQLite DB file and uploads persisted via Docker volumes (survives container restarts)
- Frontend proxies API calls to backend via Vite dev proxy
- No authentication (single-user app)
- No external database service required
