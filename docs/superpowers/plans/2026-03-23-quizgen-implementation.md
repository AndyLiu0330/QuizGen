# QuizGen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-user quiz generator web app where users upload PDF/PPTX files, AI generates multiple-choice quizzes, and users take, grade, and review quizzes.

**Architecture:** FastAPI backend with SQLAlchemy/SQLite for data, markitdown for file parsing, OpenAI API for question generation. React (Vite) frontend with Tailwind CSS. Two-service Docker Compose deployment.

**Tech Stack:** Python 3.11+, FastAPI, SQLAlchemy, Alembic, markitdown, openai, React 18, Vite, Tailwind CSS, Lucide React, React Router, Docker Compose

**Spec:** `docs/superpowers/specs/2026-03-23-quizgen-architecture-design.md`
**Design System:** `design-system/MASTER.md` + `design-system/pages/*.md`

---

## File Structure

### Backend (`backend/`)

```
backend/
├── Dockerfile
├── requirements.txt
├── alembic.ini
├── alembic/
│   ├── env.py
│   └── versions/          # Migration files
├── app/
│   ├── __init__.py
│   ├── main.py            # FastAPI app, CORS, router mounting
│   ├── config.py          # Settings from .env (pydantic-settings)
│   ├── database.py        # SQLAlchemy engine, session, Base
│   ├── models.py          # Material, Session, Quiz, Question ORM models
│   ├── schemas.py         # Pydantic request/response schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── materials.py   # /api/materials endpoints
│   │   ├── sessions.py    # /api/sessions endpoints
│   │   └── quizzes.py     # /api/quizzes endpoints
│   └── services/
│       ├── __init__.py
│       ├── file_parser.py     # markitdown parsing + file validation
│       ├── quiz_generator.py  # OpenAI prompt + response parsing
│       └── grading.py         # Score calculation + weak topic computation
└── tests/
    ├── conftest.py        # Test DB fixtures, test client
    ├── test_models.py
    ├── test_file_parser.py
    ├── test_grading.py
    ├── test_quiz_generator.py
    ├── test_materials_api.py
    ├── test_sessions_api.py
    └── test_quizzes_api.py
```

### Frontend (`frontend/`)

```
frontend/
├── Dockerfile
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.jsx           # React entry, router setup
│   ├── index.css           # Tailwind imports + design tokens as CSS vars
│   ├── api.js              # API client (fetch wrapper for all endpoints)
│   ├── components/
│   │   ├── Layout.jsx      # Top nav bar + page container
│   │   ├── FileUpload.jsx  # Drag-and-drop upload zone
│   │   ├── MaterialCard.jsx
│   │   ├── QuizConfigForm.jsx  # Segmented controls for num/difficulty
│   │   ├── QuestionCard.jsx    # Single question with radio options
│   │   ├── ScoreSummary.jsx    # Score display with color coding
│   │   └── WeakTopics.jsx      # Weak topics list
│   └── pages/
│       ├── UploadPage.jsx
│       ├── SessionConfigPage.jsx
│       ├── QuizPage.jsx
│       ├── ResultsPage.jsx
│       └── HistoryPage.jsx
```

### Root

```
├── docker-compose.yml
├── .env.example
├── .gitignore
```

---

## Task 1: Project Scaffolding & Configuration

**Files:**
- Create: `.gitignore`, `.env.example`, `docker-compose.yml`
- Create: `backend/requirements.txt`, `backend/app/__init__.py`, `backend/app/config.py`
- Create: `backend/Dockerfile`, `frontend/Dockerfile`

- [ ] **Step 1: Create `.gitignore`**

```gitignore
# Python
__pycache__/
*.pyc
.venv/
*.egg-info/

# Node
node_modules/
dist/

# Environment
.env

# Database & uploads
db/
uploads/

# IDE
.vscode/
.idea/
```

- [ ] **Step 2: Create `.env.example`**

```env
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4o
DATABASE_URL=sqlite:///db/quizgen.db
MAX_UPLOAD_SIZE_MB=50
```

- [ ] **Step 3: Create `backend/requirements.txt`**

```txt
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.35
alembic==1.13.2
pydantic-settings==2.5.2
python-multipart==0.0.12
openai==1.51.0
markitdown==0.1.1
pytest==8.3.3
httpx==0.27.2
```

- [ ] **Step 4: Create `backend/app/__init__.py`**

Empty file.

- [ ] **Step 5: Create `backend/app/config.py`**

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str = "test-key-not-set"
    openai_model: str = "gpt-4o"
    database_url: str = "sqlite:///db/quizgen.db"
    max_upload_size_mb: int = 50

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


def get_settings() -> Settings:
    return Settings()


settings = get_settings()
```

- [ ] **Step 6: Create `docker-compose.yml`**

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./uploads:/app/uploads
      - ./db:/app/db
    env_file: .env

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

- [ ] **Step 7: Create `backend/Dockerfile`**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/uploads /app/db

CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

- [ ] **Step 8: Create `frontend/Dockerfile`**

```dockerfile
FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
```

- [ ] **Step 9: Commit**

```bash
git add .gitignore .env.example docker-compose.yml backend/requirements.txt backend/app/__init__.py backend/app/config.py backend/Dockerfile frontend/Dockerfile
git commit -m "feat: scaffold project structure and configuration"
```

---

## Task 2: Database Models & Migrations

**Files:**
- Create: `backend/app/database.py`, `backend/app/models.py`
- Create: `backend/alembic.ini`, `backend/alembic/env.py`
- Create: `backend/tests/__init__.py`, `backend/tests/conftest.py`, `backend/tests/test_models.py`

- [ ] **Step 1: Write test for model creation**

Create `backend/tests/__init__.py` (empty) and `backend/tests/conftest.py`:

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()
    Base.metadata.drop_all(engine)
```

Create `backend/tests/test_models.py`:

```python
from datetime import datetime, timezone

from app.models import Material, Session, Quiz, Question


def test_create_material(db_session):
    material = Material(
        file_name="test.pdf",
        file_type="pdf",
        file_size=1024,
        upload_date=datetime.now(timezone.utc),
        extracted_text="Sample text content",
    )
    db_session.add(material)
    db_session.commit()

    result = db_session.query(Material).first()
    assert result.file_name == "test.pdf"
    assert result.file_type == "pdf"
    assert result.extracted_text == "Sample text content"


def test_material_session_relationship(db_session):
    material = Material(
        file_name="test.pdf",
        file_type="pdf",
        file_size=1024,
        upload_date=datetime.now(timezone.utc),
        extracted_text="Content",
    )
    db_session.add(material)
    db_session.commit()

    session = Session(
        name="Test Session",
        created_at=datetime.now(timezone.utc),
        material_id=material.id,
    )
    db_session.add(session)
    db_session.commit()

    assert len(material.sessions) == 1
    assert material.sessions[0].name == "Test Session"


def test_quiz_question_relationship(db_session):
    material = Material(
        file_name="test.pdf",
        file_type="pdf",
        file_size=1024,
        upload_date=datetime.now(timezone.utc),
        extracted_text="Content",
    )
    db_session.add(material)
    db_session.commit()

    session = Session(
        name="Session 1",
        created_at=datetime.now(timezone.utc),
        material_id=material.id,
    )
    db_session.add(session)
    db_session.commit()

    quiz = Quiz(
        session_id=session.id,
        num_questions=2,
        difficulty="easy",
        created_at=datetime.now(timezone.utc),
    )
    db_session.add(quiz)
    db_session.commit()

    q1 = Question(
        quiz_id=quiz.id,
        question_text="What is 1+1?",
        topic="Math",
        choices=["1", "2", "3", "4"],
        correct_answer=1,
    )
    db_session.add(q1)
    db_session.commit()

    assert len(quiz.questions) == 1
    assert quiz.questions[0].choices == ["1", "2", "3", "4"]
    assert quiz.questions[0].topic == "Math"
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend && python -m pytest tests/test_models.py -v
```

Expected: FAIL — `app.database` and `app.models` do not exist yet.

- [ ] **Step 3: Create `backend/app/database.py`**

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings


engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 4: Create `backend/app/models.py`**

```python
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import relationship

from app.database import Base


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, autoincrement=True)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    upload_date = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    extracted_text = Column(Text, nullable=False)

    sessions = relationship("Session", back_populates="material", cascade="all, delete-orphan")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=False)

    material = relationship("Material", back_populates="sessions")
    quizzes = relationship("Quiz", back_populates="session", cascade="all, delete-orphan")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    num_questions = Column(Integer, nullable=False)
    difficulty = Column(String, nullable=False)
    score = Column(Float, nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    session = relationship("Session", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_text = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    choices = Column(JSON, nullable=False)
    correct_answer = Column(Integer, nullable=False)
    user_answer = Column(Integer, nullable=True)

    quiz = relationship("Quiz", back_populates="questions")
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd backend && python -m pytest tests/test_models.py -v
```

Expected: 3 tests PASS.

- [ ] **Step 6: Set up Alembic**

```bash
cd backend && alembic init alembic
```

Edit `backend/alembic.ini`: set `sqlalchemy.url = sqlite:///db/quizgen.db`

Edit `backend/alembic/env.py`: import `Base` from `app.database` and set `target_metadata = Base.metadata`. Also import all models:

```python
from app.database import Base
from app.models import Material, Session, Quiz, Question

target_metadata = Base.metadata
```

- [ ] **Step 7: Generate initial migration**

```bash
cd backend && alembic revision --autogenerate -m "initial tables"
```

- [ ] **Step 8: Commit**

```bash
git add backend/app/database.py backend/app/models.py backend/tests/ backend/alembic.ini backend/alembic/
git commit -m "feat: add database models and migrations for Material, Session, Quiz, Question"
```

---

## Task 3: Pydantic Schemas

**Files:**
- Create: `backend/app/schemas.py`

- [ ] **Step 1: Create `backend/app/schemas.py`**

```python
from datetime import datetime

from pydantic import BaseModel


# --- Material ---

class MaterialOut(BaseModel):
    id: int
    file_name: str
    file_type: str
    file_size: int
    upload_date: datetime

    model_config = {"from_attributes": True}


# --- Session ---

class SessionCreate(BaseModel):
    material_id: int


class QuizSummary(BaseModel):
    id: int
    num_questions: int
    difficulty: str
    score: float | None
    created_at: datetime
    completed_at: datetime | None

    model_config = {"from_attributes": True}


class SessionOut(BaseModel):
    id: int
    name: str
    created_at: datetime
    material_id: int

    model_config = {"from_attributes": True}


class SessionDetail(SessionOut):
    quizzes: list[QuizSummary]
    material: MaterialOut


class SessionHistoryItem(BaseModel):
    id: int
    name: str
    created_at: datetime
    material_name: str
    best_score: float | None
    weak_topics: list[str]


# --- Quiz ---

class QuizCreate(BaseModel):
    session_id: int
    num_questions: int
    difficulty: str


class QuestionOut(BaseModel):
    id: int
    question_text: str
    topic: str
    choices: list[str]
    user_answer: int | None

    model_config = {"from_attributes": True}


class QuestionWithAnswer(QuestionOut):
    correct_answer: int


class QuizOut(BaseModel):
    id: int
    session_id: int
    num_questions: int
    difficulty: str
    score: float | None
    created_at: datetime
    completed_at: datetime | None
    questions: list[QuestionOut]

    model_config = {"from_attributes": True}


class QuizResult(BaseModel):
    id: int
    session_id: int
    num_questions: int
    difficulty: str
    score: float
    created_at: datetime
    completed_at: datetime
    questions: list[QuestionWithAnswer]
    weak_topics: list[str]

    model_config = {"from_attributes": True}


class QuizSubmit(BaseModel):
    answers: dict[int, int]  # question_id -> selected choice index
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/schemas.py
git commit -m "feat: add Pydantic request/response schemas"
```

---

## Task 4: FileParserService

**Files:**
- Create: `backend/app/services/__init__.py`, `backend/app/services/file_parser.py`
- Create: `backend/tests/test_file_parser.py`

- [ ] **Step 1: Write failing tests**

Create `backend/app/services/__init__.py` (empty).

Create `backend/tests/test_file_parser.py`:

```python
import pytest

from app.services.file_parser import FileParserService


def test_validate_file_type_pdf():
    service = FileParserService()
    assert service.validate_file_type("document.pdf") is True


def test_validate_file_type_pptx():
    service = FileParserService()
    assert service.validate_file_type("slides.pptx") is True


def test_validate_file_type_invalid():
    service = FileParserService()
    assert service.validate_file_type("image.jpg") is False


def test_validate_file_size_within_limit():
    service = FileParserService(max_size_mb=50)
    assert service.validate_file_size(10 * 1024 * 1024) is True  # 10MB


def test_validate_file_size_exceeds_limit():
    service = FileParserService(max_size_mb=50)
    assert service.validate_file_size(60 * 1024 * 1024) is False  # 60MB


def test_get_file_extension():
    service = FileParserService()
    assert service.get_file_extension("report.pdf") == "pdf"
    assert service.get_file_extension("slides.PPTX") == "pptx"
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend && python -m pytest tests/test_file_parser.py -v
```

Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `backend/app/services/file_parser.py`**

```python
from pathlib import Path

from markitdown import MarkItDown


ALLOWED_EXTENSIONS = {"pdf", "pptx"}


class FileParserService:
    def __init__(self, max_size_mb: int = 50):
        self.max_size_bytes = max_size_mb * 1024 * 1024
        self.converter = MarkItDown()

    def get_file_extension(self, filename: str) -> str:
        return Path(filename).suffix.lstrip(".").lower()

    def validate_file_type(self, filename: str) -> bool:
        ext = self.get_file_extension(filename)
        return ext in ALLOWED_EXTENSIONS

    def validate_file_size(self, size_bytes: int) -> bool:
        return size_bytes <= self.max_size_bytes

    def parse_file(self, file_path: str) -> str:
        """Parse a PDF or PPTX file and return extracted text as markdown."""
        result = self.converter.convert(file_path)
        return result.text_content
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd backend && python -m pytest tests/test_file_parser.py -v
```

Expected: 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/ backend/tests/test_file_parser.py
git commit -m "feat: add FileParserService with validation and markitdown parsing"
```

---

## Task 5: GradingService

**Files:**
- Create: `backend/app/services/grading.py`
- Create: `backend/tests/test_grading.py`

- [ ] **Step 1: Write failing tests**

Create `backend/tests/test_grading.py`:

```python
from app.services.grading import GradingService


def test_calculate_score_all_correct():
    questions = [
        {"correct_answer": 0, "user_answer": 0, "topic": "Math"},
        {"correct_answer": 2, "user_answer": 2, "topic": "Science"},
    ]
    service = GradingService()
    assert service.calculate_score(questions) == 100.0


def test_calculate_score_half_correct():
    questions = [
        {"correct_answer": 0, "user_answer": 0, "topic": "Math"},
        {"correct_answer": 2, "user_answer": 1, "topic": "Science"},
    ]
    service = GradingService()
    assert service.calculate_score(questions) == 50.0


def test_calculate_score_none_correct():
    questions = [
        {"correct_answer": 0, "user_answer": 1, "topic": "Math"},
        {"correct_answer": 2, "user_answer": 3, "topic": "Science"},
    ]
    service = GradingService()
    assert service.calculate_score(questions) == 0.0


def test_compute_weak_topics():
    questions = [
        {"correct_answer": 0, "user_answer": 0, "topic": "Math"},
        {"correct_answer": 1, "user_answer": 1, "topic": "Math"},
        {"correct_answer": 2, "user_answer": 0, "topic": "Science"},
        {"correct_answer": 1, "user_answer": 0, "topic": "Science"},
    ]
    service = GradingService()
    weak = service.compute_weak_topics(questions)
    assert "Science" in weak
    assert "Math" not in weak


def test_compute_weak_topics_threshold():
    # 1 out of 2 correct = 50%, which is NOT weak (threshold is < 50%)
    questions = [
        {"correct_answer": 0, "user_answer": 0, "topic": "History"},
        {"correct_answer": 1, "user_answer": 2, "topic": "History"},
    ]
    service = GradingService()
    weak = service.compute_weak_topics(questions)
    assert "History" not in weak
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend && python -m pytest tests/test_grading.py -v
```

Expected: FAIL.

- [ ] **Step 3: Implement `backend/app/services/grading.py`**

```python
from collections import defaultdict


class GradingService:
    def calculate_score(self, questions: list[dict]) -> float:
        """Calculate score as percentage of correct answers."""
        if not questions:
            return 0.0
        correct = sum(
            1 for q in questions if q["correct_answer"] == q["user_answer"]
        )
        return round((correct / len(questions)) * 100, 1)

    def compute_weak_topics(self, questions: list[dict]) -> list[str]:
        """Return topics where accuracy is below 50%."""
        topic_stats: dict[str, dict] = defaultdict(lambda: {"correct": 0, "total": 0})

        for q in questions:
            topic = q["topic"]
            topic_stats[topic]["total"] += 1
            if q["correct_answer"] == q["user_answer"]:
                topic_stats[topic]["correct"] += 1

        weak = []
        for topic, stats in topic_stats.items():
            accuracy = stats["correct"] / stats["total"]
            if accuracy < 0.5:
                weak.append(topic)

        return sorted(weak)
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd backend && python -m pytest tests/test_grading.py -v
```

Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/grading.py backend/tests/test_grading.py
git commit -m "feat: add GradingService with score calculation and weak topic detection"
```

---

## Task 6: QuizGeneratorService

**Files:**
- Create: `backend/app/services/quiz_generator.py`
- Create: `backend/tests/test_quiz_generator.py`

- [ ] **Step 1: Write failing tests**

Create `backend/tests/test_quiz_generator.py`:

```python
import json
import pytest
from unittest.mock import MagicMock, patch

from app.services.quiz_generator import QuizGeneratorService


VALID_AI_RESPONSE = json.dumps({
    "questions": [
        {
            "question": "What is the capital of France?",
            "topic": "Geography",
            "choices": ["London", "Paris", "Berlin", "Madrid"],
            "correct_answer": 1,
        },
        {
            "question": "What is 2+2?",
            "topic": "Math",
            "choices": ["3", "4", "5", "6"],
            "correct_answer": 1,
        },
    ]
})


def test_build_prompt_contains_text_and_params():
    service = QuizGeneratorService(api_key="test-key", model="gpt-4o")
    prompt = service.build_prompt(
        text="Python is a programming language.",
        num_questions=5,
        difficulty="easy",
    )
    assert "Python is a programming language." in prompt
    assert "5" in prompt
    assert "easy" in prompt


def test_parse_response_valid():
    service = QuizGeneratorService(api_key="test-key", model="gpt-4o")
    questions = service.parse_response(VALID_AI_RESPONSE)
    assert len(questions) == 2
    assert questions[0]["question_text"] == "What is the capital of France?"
    assert questions[0]["topic"] == "Geography"
    assert questions[0]["choices"] == ["London", "Paris", "Berlin", "Madrid"]
    assert questions[0]["correct_answer"] == 1


def test_parse_response_invalid_json():
    service = QuizGeneratorService(api_key="test-key", model="gpt-4o")
    with pytest.raises(ValueError, match="Invalid response format"):
        service.parse_response("not json at all")


def test_parse_response_missing_fields():
    service = QuizGeneratorService(api_key="test-key", model="gpt-4o")
    bad_response = json.dumps({"questions": [{"question": "Q?"}]})
    with pytest.raises(ValueError, match="Invalid response format"):
        service.parse_response(bad_response)


def test_parse_response_invalid_correct_answer():
    service = QuizGeneratorService(api_key="test-key", model="gpt-4o")
    bad_response = json.dumps({
        "questions": [
            {
                "question": "Q?",
                "topic": "T",
                "choices": ["A", "B", "C", "D"],
                "correct_answer": 5,  # Out of range
            }
        ]
    })
    with pytest.raises(ValueError, match="Invalid response format"):
        service.parse_response(bad_response)
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend && python -m pytest tests/test_quiz_generator.py -v
```

Expected: FAIL.

- [ ] **Step 3: Implement `backend/app/services/quiz_generator.py`**

```python
import json

from openai import AsyncOpenAI


class QuizGeneratorService:
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model

    def build_prompt(self, text: str, num_questions: int, difficulty: str) -> str:
        difficulty_guide = {
            "easy": "recall and basic understanding",
            "medium": "understanding and application",
            "hard": "application, analysis, and critical thinking",
        }
        level = difficulty_guide.get(difficulty, "understanding")

        return f"""Generate exactly {num_questions} multiple-choice questions from the following text.
Difficulty level: {difficulty} — focus on {level}.

For each question, provide:
- "question": the question text
- "topic": a short topic/section label derived from the source material
- "choices": exactly 4 answer options
- "correct_answer": the index (0-3) of the correct choice

Return ONLY valid JSON in this exact format:
{{
  "questions": [
    {{
      "question": "...",
      "topic": "...",
      "choices": ["A", "B", "C", "D"],
      "correct_answer": 0
    }}
  ]
}}

Source text:
{text}"""

    def parse_response(self, response_text: str) -> list[dict]:
        """Parse and validate the AI response JSON."""
        try:
            data = json.loads(response_text)
        except json.JSONDecodeError:
            raise ValueError("Invalid response format: not valid JSON")

        if "questions" not in data or not isinstance(data["questions"], list):
            raise ValueError("Invalid response format: missing questions array")

        questions = []
        for q in data["questions"]:
            if not all(k in q for k in ("question", "topic", "choices", "correct_answer")):
                raise ValueError("Invalid response format: missing required fields")
            if not isinstance(q["choices"], list) or len(q["choices"]) != 4:
                raise ValueError("Invalid response format: choices must be array of 4")
            if not isinstance(q["correct_answer"], int) or q["correct_answer"] not in range(4):
                raise ValueError("Invalid response format: correct_answer must be 0-3")

            questions.append({
                "question_text": q["question"],
                "topic": q["topic"],
                "choices": q["choices"],
                "correct_answer": q["correct_answer"],
            })

        return questions

    async def generate(self, text: str, num_questions: int, difficulty: str) -> list[dict]:
        """Call OpenAI API to generate quiz questions."""
        prompt = self.build_prompt(text, num_questions, difficulty)

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a quiz question generator. Return only valid JSON."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content
        return self.parse_response(content)
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd backend && python -m pytest tests/test_quiz_generator.py -v
```

Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/quiz_generator.py backend/tests/test_quiz_generator.py
git commit -m "feat: add QuizGeneratorService with OpenAI prompt and response validation"
```

---

## Task 7: Materials API Router

**Files:**
- Create: `backend/app/routers/__init__.py`, `backend/app/routers/materials.py`
- Create: `backend/app/main.py`
- Create: `backend/tests/test_materials_api.py`

- [ ] **Step 1: Update `backend/tests/conftest.py` with API test fixtures**

Add to existing `conftest.py`:

```python
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app


@pytest.fixture
def test_app(db_session):
    """FastAPI test client with overridden DB dependency."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    TestSession = sessionmaker(bind=engine)

    def override_get_db():
        session = TestSession()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)
```

- [ ] **Step 2: Write failing tests**

Create `backend/tests/test_materials_api.py`:

```python
def test_list_materials_empty(test_app):
    response = test_app.get("/api/materials")
    assert response.status_code == 200
    assert response.json() == []


def test_upload_invalid_file_type(test_app):
    response = test_app.post(
        "/api/materials/upload",
        files={"file": ("test.jpg", b"fake content", "image/jpeg")},
    )
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd backend && python -m pytest tests/test_materials_api.py -v
```

Expected: FAIL.

- [ ] **Step 4: Create `backend/app/routers/__init__.py`** (empty)

- [ ] **Step 5: Create `backend/app/main.py`**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import materials, sessions, quizzes

app = FastAPI(title="QuizGen API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(materials.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(quizzes.router, prefix="/api")
```

- [ ] **Step 6: Create `backend/app/routers/materials.py`**

```python
import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session as DBSession

from app.config import settings
from app.database import get_db
from app.models import Material
from app.schemas import MaterialOut
from app.services.file_parser import FileParserService

router = APIRouter()
file_parser = FileParserService(max_size_mb=settings.max_upload_size_mb)

UPLOAD_DIR = "uploads"


@router.post("/materials/upload", response_model=MaterialOut)
async def upload_material(file: UploadFile, db: DBSession = Depends(get_db)):
    if not file_parser.validate_file_type(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported file type. Only PDF and PPTX are allowed.")

    content = await file.read()
    file_size = len(content)

    if not file_parser.validate_file_size(file_size):
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {settings.max_upload_size_mb}MB.",
        )

    # Save file to disk with UUID prefix to avoid collisions
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, stored_name)
    with open(file_path, "wb") as f:
        f.write(content)

    # Parse file
    try:
        extracted_text = file_parser.parse_file(file_path)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    if not extracted_text or not extracted_text.strip():
        # Allow but warn — extracted_text stored as empty
        extracted_text = ""

    material = Material(
        file_name=file.filename,
        file_type=file_parser.get_file_extension(file.filename),
        file_size=file_size,
        extracted_text=extracted_text,
    )
    db.add(material)
    db.commit()
    db.refresh(material)

    return material


@router.get("/materials", response_model=list[MaterialOut])
def list_materials(db: DBSession = Depends(get_db)):
    return db.query(Material).order_by(Material.upload_date.desc()).all()


@router.delete("/materials/{material_id}")
def delete_material(material_id: int, db: DBSession = Depends(get_db)):
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    # Delete file from disk
    file_path = os.path.join(UPLOAD_DIR, material.file_name)
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(material)
    db.commit()
    return {"ok": True}
```

- [ ] **Step 7: Create stub routers for sessions and quizzes** (so main.py imports work)

Create `backend/app/routers/sessions.py`:
```python
from fastapi import APIRouter

router = APIRouter()
```

Create `backend/app/routers/quizzes.py`:
```python
from fastapi import APIRouter

router = APIRouter()
```

- [ ] **Step 8: Run tests to verify they pass**

```bash
cd backend && python -m pytest tests/test_materials_api.py -v
```

Expected: 2 tests PASS.

- [ ] **Step 9: Commit**

```bash
git add backend/app/main.py backend/app/routers/ backend/tests/test_materials_api.py backend/tests/conftest.py
git commit -m "feat: add materials API with upload, list, and delete endpoints"
```

---

## Task 8: Sessions API Router

**Files:**
- Modify: `backend/app/routers/sessions.py`
- Create: `backend/tests/test_sessions_api.py`

- [ ] **Step 1: Write failing tests**

Create `backend/tests/test_sessions_api.py`:

```python
from datetime import datetime, timezone

from app.models import Material, Session as SessionModel, Quiz, Question


def _seed_material(db):
    """Helper to insert a material directly into the DB."""
    m = Material(
        file_name="test.pdf",
        file_type="pdf",
        file_size=1024,
        upload_date=datetime.now(timezone.utc),
        extracted_text="Sample content",
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


def test_create_session(test_app, test_db):
    material = _seed_material(test_db)
    response = test_app.post("/api/sessions", json={"material_id": material.id})
    assert response.status_code == 200
    data = response.json()
    assert data["material_id"] == material.id
    assert "test.pdf" in data["name"]


def test_list_sessions(test_app, test_db):
    material = _seed_material(test_db)
    test_app.post("/api/sessions", json={"material_id": material.id})
    response = test_app.get("/api/sessions")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


def test_get_session_detail(test_app, test_db):
    material = _seed_material(test_db)
    create_resp = test_app.post("/api/sessions", json={"material_id": material.id})
    session_id = create_resp.json()["id"]

    response = test_app.get(f"/api/sessions/{session_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == session_id
    assert "quizzes" in data
    assert "material" in data
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend && python -m pytest tests/test_sessions_api.py -v
```

Expected: FAIL.

Note: The `test_db` fixture needs to be added to `conftest.py`. Update the `test_app` fixture to also yield a `test_db` fixture:

Update `backend/tests/conftest.py` — replace the `test_app` fixture:

```python
@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    TestSession = sessionmaker(bind=engine)
    session = TestSession()
    yield session
    session.close()
    Base.metadata.drop_all(engine)


@pytest.fixture
def test_app(test_db):
    """FastAPI test client with overridden DB dependency."""
    def override_get_db():
        yield test_db

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()
```

- [ ] **Step 3: Implement `backend/app/routers/sessions.py`**

```python
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models import Material, Session, Quiz, Question
from app.schemas import SessionCreate, SessionOut, SessionDetail, SessionHistoryItem
from app.services.grading import GradingService

router = APIRouter()
grading_service = GradingService()


@router.post("/sessions", response_model=SessionOut)
def create_session(body: SessionCreate, db: DBSession = Depends(get_db)):
    material = db.query(Material).filter(Material.id == body.material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    now = datetime.now(timezone.utc)
    name = f"{material.file_name} — {now.strftime('%Y-%m-%d %H:%M')}"

    session = Session(name=name, created_at=now, material_id=material.id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions", response_model=list[SessionHistoryItem])
def list_sessions(db: DBSession = Depends(get_db)):
    sessions = (
        db.query(Session)
        .order_by(Session.created_at.desc())
        .all()
    )

    result = []
    for session in sessions:
        # Compute best score across all quizzes in this session
        completed_quizzes = [q for q in session.quizzes if q.score is not None]
        best_score = max((q.score for q in completed_quizzes), default=None)

        # Compute weak topics from the latest completed quiz using GradingService
        weak_topics = []
        if completed_quizzes:
            latest = max(completed_quizzes, key=lambda q: q.completed_at)
            question_dicts = [
                {"correct_answer": q.correct_answer, "user_answer": q.user_answer, "topic": q.topic}
                for q in latest.questions
            ]
            weak_topics = grading_service.compute_weak_topics(question_dicts)

        result.append(SessionHistoryItem(
            id=session.id,
            name=session.name,
            created_at=session.created_at,
            material_name=session.material.file_name,
            best_score=best_score,
            weak_topics=sorted(weak_topics),
        ))

    return result


@router.get("/sessions/{session_id}", response_model=SessionDetail)
def get_session(session_id: int, db: DBSession = Depends(get_db)):
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd backend && python -m pytest tests/test_sessions_api.py -v
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/routers/sessions.py backend/tests/test_sessions_api.py backend/tests/conftest.py
git commit -m "feat: add sessions API with create, list (with stats), and detail endpoints"
```

---

## Task 9: Quizzes API Router

**Files:**
- Modify: `backend/app/routers/quizzes.py`
- Create: `backend/tests/test_quizzes_api.py`

- [ ] **Step 1: Write failing tests**

Create `backend/tests/test_quizzes_api.py`:

```python
from datetime import datetime, timezone
from unittest.mock import patch, AsyncMock

from app.models import Material, Session as SessionModel, Quiz, Question


def _seed_session(db):
    material = Material(
        file_name="test.pdf",
        file_type="pdf",
        file_size=1024,
        upload_date=datetime.now(timezone.utc),
        extracted_text="Python is a programming language used for web development.",
    )
    db.add(material)
    db.commit()

    session = SessionModel(
        name="Test Session",
        created_at=datetime.now(timezone.utc),
        material_id=material.id,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def _seed_completed_quiz(db, session_id):
    quiz = Quiz(
        session_id=session_id,
        num_questions=2,
        difficulty="easy",
        score=50.0,
        created_at=datetime.now(timezone.utc),
        completed_at=datetime.now(timezone.utc),
    )
    db.add(quiz)
    db.commit()

    q1 = Question(
        quiz_id=quiz.id,
        question_text="What is Python?",
        topic="Basics",
        choices=["A language", "A snake", "A tool", "A game"],
        correct_answer=0,
        user_answer=0,
    )
    q2 = Question(
        quiz_id=quiz.id,
        question_text="Python is used for?",
        topic="Usage",
        choices=["Cooking", "Web dev", "Flying", "Swimming"],
        correct_answer=1,
        user_answer=2,
    )
    db.add_all([q1, q2])
    db.commit()
    db.refresh(quiz)
    return quiz


MOCK_AI_QUESTIONS = [
    {
        "question_text": "What is Python?",
        "topic": "Basics",
        "choices": ["A language", "A snake", "A tool", "A game"],
        "correct_answer": 0,
    },
    {
        "question_text": "Python is used for?",
        "topic": "Usage",
        "choices": ["Cooking", "Web dev", "Flying", "Swimming"],
        "correct_answer": 1,
    },
]


@patch("app.routers.quizzes.get_quiz_generator")
def test_generate_quiz(mock_get_gen, test_app, test_db):
    mock_gen = AsyncMock()
    mock_get_gen.return_value = mock_gen
    mock_generate = mock_gen.generate
    mock_generate.return_value = MOCK_AI_QUESTIONS
    session = _seed_session(test_db)

    response = test_app.post("/api/quizzes", json={
        "session_id": session.id,
        "num_questions": 2,
        "difficulty": "easy",
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["questions"]) == 2
    # Should NOT expose correct_answer before submission
    assert "correct_answer" not in data["questions"][0]


def test_get_quiz_hides_answers(test_app, test_db):
    session = _seed_session(test_db)
    quiz = _seed_completed_quiz(test_db, session.id)

    # Reset to incomplete to test answer hiding
    quiz.score = None
    quiz.completed_at = None
    for q in quiz.questions:
        q.user_answer = None
    test_db.commit()

    response = test_app.get(f"/api/quizzes/{quiz.id}")
    assert response.status_code == 200
    data = response.json()
    assert "correct_answer" not in data["questions"][0]


def test_submit_quiz(test_app, test_db):
    session = _seed_session(test_db)
    quiz = _seed_completed_quiz(test_db, session.id)

    # Reset to not-yet-submitted
    quiz.score = None
    quiz.completed_at = None
    for q in quiz.questions:
        q.user_answer = None
    test_db.commit()

    questions = quiz.questions
    response = test_app.post(f"/api/quizzes/{quiz.id}/submit", json={
        "answers": {
            str(questions[0].id): 0,  # correct
            str(questions[1].id): 1,  # correct
        }
    })
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 100.0
    assert "questions" in data
    assert "correct_answer" in data["questions"][0]


def test_retake_quiz(test_app, test_db):
    session = _seed_session(test_db)
    quiz = _seed_completed_quiz(test_db, session.id)

    response = test_app.post(f"/api/quizzes/{quiz.id}/retake")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] != quiz.id  # New quiz created
    assert len(data["questions"]) == 2
    # All user_answers should be None
    for q in data["questions"]:
        assert q["user_answer"] is None
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend && python -m pytest tests/test_quizzes_api.py -v
```

Expected: FAIL.

- [ ] **Step 3: Implement `backend/app/routers/quizzes.py`**

```python
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from app.config import settings
from app.database import get_db
from app.models import Session, Quiz, Question
from app.schemas import QuizCreate, QuizOut, QuizResult, QuizSubmit
from app.services.grading import GradingService
from app.services.quiz_generator import QuizGeneratorService

router = APIRouter()
grading_service = GradingService()

_quiz_generator = None


def get_quiz_generator() -> QuizGeneratorService:
    global _quiz_generator
    if _quiz_generator is None:
        _quiz_generator = QuizGeneratorService(
            api_key=settings.openai_api_key,
            model=settings.openai_model,
        )
    return _quiz_generator


@router.post("/quizzes", response_model=QuizOut)
async def generate_quiz(body: QuizCreate, db: DBSession = Depends(get_db)):
    session = db.query(Session).filter(Session.id == body.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    material = session.material
    if not material.extracted_text.strip():
        raise HTTPException(status_code=400, detail="Material has no extracted text for quiz generation.")

    try:
        ai_questions = await get_quiz_generator().generate(
            text=material.extracted_text,
            num_questions=body.num_questions,
            difficulty=body.difficulty,
        )
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"AI generation failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")

    quiz = Quiz(
        session_id=session.id,
        num_questions=body.num_questions,
        difficulty=body.difficulty,
        created_at=datetime.now(timezone.utc),
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    for q in ai_questions:
        question = Question(
            quiz_id=quiz.id,
            question_text=q["question_text"],
            topic=q["topic"],
            choices=q["choices"],
            correct_answer=q["correct_answer"],
        )
        db.add(question)
    db.commit()
    db.refresh(quiz)

    return quiz


@router.get("/quizzes/{quiz_id}", response_model=QuizOut)
def get_quiz(quiz_id: int, db: DBSession = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz


@router.post("/quizzes/{quiz_id}/submit", response_model=QuizResult)
def submit_quiz(quiz_id: int, body: QuizSubmit, db: DBSession = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    if quiz.completed_at is not None:
        raise HTTPException(status_code=400, detail="Quiz already submitted")

    # Apply user answers
    for question in quiz.questions:
        answer = body.answers.get(question.id)
        if answer is not None:
            question.user_answer = answer

    # Grade
    question_dicts = [
        {
            "correct_answer": q.correct_answer,
            "user_answer": q.user_answer,
            "topic": q.topic,
        }
        for q in quiz.questions
    ]

    quiz.score = grading_service.calculate_score(question_dicts)
    quiz.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(quiz)

    weak_topics = grading_service.compute_weak_topics(question_dicts)

    return QuizResult(
        id=quiz.id,
        session_id=quiz.session_id,
        num_questions=quiz.num_questions,
        difficulty=quiz.difficulty,
        score=quiz.score,
        created_at=quiz.created_at,
        completed_at=quiz.completed_at,
        questions=quiz.questions,
        weak_topics=weak_topics,
    )


@router.post("/quizzes/{quiz_id}/retake", response_model=QuizOut)
def retake_quiz(quiz_id: int, db: DBSession = Depends(get_db)):
    original = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Quiz not found")

    new_quiz = Quiz(
        session_id=original.session_id,
        num_questions=original.num_questions,
        difficulty=original.difficulty,
        created_at=datetime.now(timezone.utc),
    )
    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)

    for orig_q in original.questions:
        question = Question(
            quiz_id=new_quiz.id,
            question_text=orig_q.question_text,
            topic=orig_q.topic,
            choices=orig_q.choices,
            correct_answer=orig_q.correct_answer,
            user_answer=None,
        )
        db.add(question)
    db.commit()
    db.refresh(new_quiz)

    return new_quiz
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd backend && python -m pytest tests/test_quizzes_api.py -v
```

Expected: 4 tests PASS.

- [ ] **Step 5: Run all backend tests**

```bash
cd backend && python -m pytest -v
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/app/routers/quizzes.py backend/tests/test_quizzes_api.py
git commit -m "feat: add quizzes API with generate, get, submit, and retake endpoints"
```

---

## Task 10: Frontend Scaffolding

**Files:**
- Create: `frontend/package.json`, `frontend/vite.config.js`, `frontend/tailwind.config.js`
- Create: `frontend/index.html`, `frontend/src/main.jsx`, `frontend/src/index.css`

- [ ] **Step 1: Initialize frontend project**

```bash
cd frontend && npm create vite@latest . -- --template react
```

If the directory already has files, confirm overwrite. Then:

```bash
cd frontend && npm install
npm install -D tailwindcss @tailwindcss/vite
npm install react-router-dom lucide-react
```

- [ ] **Step 2: Configure Vite with Tailwind and API proxy**

Replace `frontend/vite.config.js`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 3: Configure Tailwind with design system**

Replace `frontend/src/index.css`:

```css
@import "tailwindcss";
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

@theme {
  --font-sans: "Inter", "system-ui", "sans-serif";

  --color-primary: #2563eb;
  --color-on-primary: #ffffff;
  --color-secondary: #7c3aed;
  --color-on-secondary: #ffffff;
  --color-accent: #f59e0b;
  --color-on-accent: #0f172a;
  --color-background: #eff6ff;
  --color-foreground: #0f172a;
  --color-card: #ffffff;
  --color-card-foreground: #0f172a;
  --color-muted: #f1f5fd;
  --color-muted-foreground: #64748b;
  --color-border: #e4ecfc;
  --color-destructive: #dc2626;
  --color-on-destructive: #ffffff;
  --color-success: #16a34a;
  --color-on-success: #ffffff;
  --color-ring: #2563eb;
}

body {
  background-color: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans);
}
```

- [ ] **Step 4: Create `frontend/src/main.jsx` with router setup**

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Layout from "./components/Layout";
import UploadPage from "./pages/UploadPage";
import SessionConfigPage from "./pages/SessionConfigPage";
import QuizPage from "./pages/QuizPage";
import ResultsPage from "./pages/ResultsPage";
import HistoryPage from "./pages/HistoryPage";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<UploadPage />} />
          <Route path="/sessions/:id" element={<SessionConfigPage />} />
          <Route path="/quizzes/:id" element={<QuizPage />} />
          <Route path="/quizzes/:id/results" element={<ResultsPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
```

- [ ] **Step 5: Update `frontend/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>QuizGen</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold React frontend with Vite, Tailwind, and routing"
```

---

## Task 11: API Client & Layout Component

**Files:**
- Create: `frontend/src/api.js`
- Create: `frontend/src/components/Layout.jsx`

- [ ] **Step 1: Create `frontend/src/api.js`**

```js
const API_BASE = "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// Materials
export function listMaterials() {
  return request("/materials");
}

export function uploadMaterial(file) {
  const formData = new FormData();
  formData.append("file", file);
  return fetch(`${API_BASE}/materials/upload`, { method: "POST", body: formData }).then(
    async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(err.detail);
      }
      return res.json();
    }
  );
}

export function deleteMaterial(id) {
  return request(`/materials/${id}`, { method: "DELETE" });
}

// Sessions
export function listSessions() {
  return request("/sessions");
}

export function createSession(materialId) {
  return request("/sessions", {
    method: "POST",
    body: JSON.stringify({ material_id: materialId }),
  });
}

export function getSession(id) {
  return request(`/sessions/${id}`);
}

// Quizzes
export function generateQuiz(sessionId, numQuestions, difficulty) {
  return request("/quizzes", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      num_questions: numQuestions,
      difficulty,
    }),
  });
}

export function getQuiz(id) {
  return request(`/quizzes/${id}`);
}

export function submitQuiz(id, answers) {
  return request(`/quizzes/${id}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export function retakeQuiz(id) {
  return request(`/quizzes/${id}/retake`, { method: "POST" });
}
```

- [ ] **Step 2: Create `frontend/src/components/Layout.jsx`**

```jsx
import { Link, Outlet } from "react-router-dom";
import { BookOpen, History } from "lucide-react";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-foreground font-semibold text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              QuizGen
            </Link>
            <Link
              to="/history"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              <History className="h-4 w-4" />
              History
            </Link>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api.js frontend/src/components/Layout.jsx
git commit -m "feat: add API client and Layout component with navigation"
```

---

## Task 12: Upload Page

**Files:**
- Create: `frontend/src/components/FileUpload.jsx`
- Create: `frontend/src/components/MaterialCard.jsx`
- Create: `frontend/src/pages/UploadPage.jsx`

Reference: `design-system/pages/upload.md`

- [ ] **Step 1: Create `frontend/src/components/FileUpload.jsx`**

```jsx
import { useState, useRef } from "react";
import { Upload } from "lucide-react";

export default function FileUpload({ onUpload, isUploading }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  }

  function handleClick() {
    inputRef.current?.click();
  }

  function handleChange(e) {
    const file = e.target.files[0];
    if (file) onUpload(file);
    e.target.value = "";
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        flex flex-col items-center justify-center min-h-[120px] rounded-lg border-2 border-dashed
        cursor-pointer transition-colors duration-150
        ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary hover:bg-muted"}
        ${isUploading ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">
        {isUploading ? "Uploading..." : "Drag files here or click to browse"}
      </p>
      <p className="text-xs text-muted-foreground mt-1">PDF, PPTX — Max 50MB</p>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.pptx"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
```

- [ ] **Step 2: Create `frontend/src/components/MaterialCard.jsx`**

```jsx
import { FileText, Presentation, Trash2 } from "lucide-react";

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MaterialCard({ material, onClick, onDelete }) {
  const Icon = material.file_type === "pdf" ? FileText : Presentation;

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-4 p-4 bg-card border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors duration-150"
    >
      <Icon className="h-8 w-8 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-card-foreground truncate">{material.file_name}</p>
        <p className="text-xs text-muted-foreground">
          {material.file_type.toUpperCase()} · {formatFileSize(material.file_size)} · {formatDate(material.upload_date)}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(material.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all duration-150 cursor-pointer"
        aria-label={`Delete ${material.file_name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Create `frontend/src/pages/UploadPage.jsx`**

```jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import MaterialCard from "../components/MaterialCard";
import { listMaterials, uploadMaterial, deleteMaterial, createSession } from "../api";

export default function UploadPage() {
  const [materials, setMaterials] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMaterials();
  }, []);

  async function loadMaterials() {
    try {
      const data = await listMaterials();
      setMaterials(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpload(file) {
    setError(null);
    setIsUploading(true);
    try {
      await uploadMaterial(file);
      await loadMaterials();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleMaterialClick(material) {
    try {
      const session = await createSession(material.id);
      navigate(`/sessions/${session.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Upload Materials</h1>

      <FileUpload onUpload={handleUpload} isUploading={isUploading} />

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <div className="space-y-3">
        {materials.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No materials uploaded yet
          </p>
        ) : (
          materials.map((m) => (
            <MaterialCard
              key={m.id}
              material={m}
              onClick={() => handleMaterialClick(m)}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify it renders**

```bash
cd frontend && npm run dev
```

Open `http://localhost:3000` — should see the upload page with drag-and-drop zone.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/FileUpload.jsx frontend/src/components/MaterialCard.jsx frontend/src/pages/UploadPage.jsx
git commit -m "feat: add Upload page with drag-and-drop and material list"
```

---

## Task 13: Session Config Page

**Files:**
- Create: `frontend/src/components/QuizConfigForm.jsx`
- Create: `frontend/src/pages/SessionConfigPage.jsx`

Reference: `design-system/pages/session-config.md`

- [ ] **Step 1: Create `frontend/src/components/QuizConfigForm.jsx`**

```jsx
import { useState } from "react";
import { Loader2 } from "lucide-react";

const NUM_OPTIONS = [5, 10, 15, 20];
const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"];

export default function QuizConfigForm({ onGenerate, isGenerating }) {
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");

  function handleSubmit(e) {
    e.preventDefault();
    onGenerate(numQuestions, difficulty);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-5">
      <h2 className="text-lg font-semibold text-card-foreground">Generate New Quiz</h2>

      <div className="space-y-2">
        <label className="text-sm font-medium text-card-foreground">Number of Questions</label>
        <div className="flex gap-1">
          {NUM_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNumQuestions(n)}
              className={`flex-1 py-2 text-sm rounded-md transition-colors duration-150 cursor-pointer ${
                numQuestions === n
                  ? "bg-primary text-on-primary"
                  : "bg-muted text-card-foreground hover:bg-border"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-card-foreground">Difficulty</label>
        <div className="flex gap-1">
          {DIFFICULTY_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`flex-1 py-2 text-sm rounded-md capitalize transition-colors duration-150 cursor-pointer ${
                difficulty === d
                  ? "bg-primary text-on-primary"
                  : "bg-muted text-card-foreground hover:bg-border"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isGenerating}
        className="w-full py-2.5 bg-primary text-on-primary text-sm font-medium rounded-md hover:opacity-90 transition-opacity duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
      >
        {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
        {isGenerating ? "Generating..." : "Generate Quiz"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Create `frontend/src/pages/SessionConfigPage.jsx`**

```jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSession, generateQuiz } from "../api";
import QuizConfigForm from "../components/QuizConfigForm";

function scoreColor(score) {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-accent";
  return "text-destructive";
}

export default function SessionConfigPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSession();
  }, [id]);

  async function loadSession() {
    try {
      const data = await getSession(id);
      setSession(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGenerate(numQuestions, difficulty) {
    setError(null);
    setIsGenerating(true);
    try {
      const quiz = await generateQuiz(session.id, numQuestions, difficulty);
      navigate(`/quizzes/${quiz.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  }

  if (!session) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{session.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {session.material.file_name} · {session.material.file_type.toUpperCase()}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <QuizConfigForm onGenerate={handleGenerate} isGenerating={isGenerating} />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Previous Quizzes</h2>
        {session.quizzes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No quizzes yet — generate your first one above
          </p>
        ) : (
          session.quizzes.map((quiz) => (
            <div
              key={quiz.id}
              onClick={() =>
                navigate(quiz.completed_at ? `/quizzes/${quiz.id}/results` : `/quizzes/${quiz.id}`)
              }
              className="flex items-center justify-between p-4 bg-card border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors duration-150"
            >
              <div>
                <p className="text-sm font-medium text-card-foreground">
                  Quiz #{quiz.id} · <span className="capitalize">{quiz.difficulty}</span> · {quiz.num_questions} questions
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(quiz.created_at).toLocaleDateString()}
                </p>
              </div>
              {quiz.score !== null ? (
                <span className={`text-sm font-semibold ${scoreColor(quiz.score)}`}>
                  {quiz.score}%
                </span>
              ) : (
                <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md">
                  In Progress
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/QuizConfigForm.jsx frontend/src/pages/SessionConfigPage.jsx
git commit -m "feat: add Session Config page with quiz generation form and quiz list"
```

---

## Task 14: Quiz Page

**Files:**
- Create: `frontend/src/components/QuestionCard.jsx`
- Create: `frontend/src/pages/QuizPage.jsx`

Reference: `design-system/pages/quiz.md`

- [ ] **Step 1: Create `frontend/src/components/QuestionCard.jsx`**

```jsx
export default function QuestionCard({ question, index, total, selectedAnswer, onSelect }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      {question.topic && (
        <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-md">
          {question.topic}
        </span>
      )}
      <p className="text-sm font-medium text-card-foreground">
        Question {index + 1} of {total}
      </p>
      <p className="text-base text-card-foreground">{question.question_text}</p>
      <div className="space-y-2">
        {question.choices.map((choice, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(question.id, i)}
            className={`w-full text-left p-3 rounded-md border text-sm transition-colors duration-150 cursor-pointer ${
              selectedAnswer === i
                ? "border-primary bg-primary/5 text-card-foreground"
                : "border-border hover:bg-muted text-card-foreground"
            }`}
          >
            <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `frontend/src/pages/QuizPage.jsx`**

```jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getQuiz, submitQuiz } from "../api";
import QuestionCard from "../components/QuestionCard";

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [id]);

  async function loadQuiz() {
    try {
      const data = await getQuiz(id);
      if (data.completed_at) {
        navigate(`/quizzes/${id}/results`, { replace: true });
        return;
      }
      setQuiz(data);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleSelect(questionId, choiceIndex) {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceIndex }));
  }

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await submitQuiz(id, answers);
      navigate(`/quizzes/${id}/results`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading quiz...</p>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalCount = quiz.questions.length;
  const allAnswered = answeredCount === totalCount;

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quiz</h1>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="capitalize">{quiz.difficulty}</span> · {quiz.num_questions} questions
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(answeredCount / totalCount) * 100}%` }}
        />
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <div className="space-y-4">
        {quiz.questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={i}
            total={totalCount}
            selectedAnswer={answers[q.id]}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Sticky submit bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {answeredCount} of {totalCount} answered
          </span>
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            className="px-6 py-2.5 bg-primary text-on-primary text-sm font-medium rounded-md hover:opacity-90 transition-opacity duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/QuestionCard.jsx frontend/src/pages/QuizPage.jsx
git commit -m "feat: add Quiz page with question cards, progress bar, and sticky submit"
```

---

## Task 15: Results Page

**Files:**
- Create: `frontend/src/components/ScoreSummary.jsx`
- Create: `frontend/src/components/WeakTopics.jsx`
- Create: `frontend/src/pages/ResultsPage.jsx`

Reference: `design-system/pages/results.md`

- [ ] **Step 1: Create `frontend/src/components/ScoreSummary.jsx`**

```jsx
function scoreColor(score) {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-accent";
  return "text-destructive";
}

export default function ScoreSummary({ score, correct, total }) {
  return (
    <div className="bg-card border border-border rounded-lg p-8 text-center">
      <p className={`text-5xl font-bold ${scoreColor(score)}`}>{score}%</p>
      <p className="text-sm text-muted-foreground mt-2">
        {correct} out of {total} correct
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create `frontend/src/components/WeakTopics.jsx`**

```jsx
import { AlertTriangle } from "lucide-react";

export default function WeakTopics({ topics }) {
  if (!topics || topics.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-base font-semibold text-card-foreground flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-accent" />
        Areas to Improve
      </h2>
      <ul className="space-y-1">
        {topics.map((topic) => (
          <li key={topic} className="text-sm text-muted-foreground">
            · {topic}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: Create `frontend/src/pages/ResultsPage.jsx`**

```jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import { getQuiz, submitQuiz, retakeQuiz } from "../api";
import ScoreSummary from "../components/ScoreSummary";
import WeakTopics from "../components/WeakTopics";

export default function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResults();
  }, [id]);

  async function loadResults() {
    try {
      // Try to get quiz result (with answers). If it has score, it's completed.
      // We call submitQuiz response format which includes correct_answer.
      // For a completed quiz, GET /quizzes/:id returns QuizOut (no correct_answer).
      // We need to use the submit response or a dedicated results endpoint.
      // Workaround: fetch quiz and compute from available data.
      const data = await getQuiz(id);
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRetake() {
    try {
      const newQuiz = await retakeQuiz(id);
      navigate(`/quizzes/${newQuiz.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) {
    return <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>;
  }

  if (!result) return <div className="text-muted-foreground">Loading...</div>;

  const questions = result.questions || [];
  const correct = questions.filter((q) => q.user_answer === q.correct_answer).length;
  const weakTopics = result.weak_topics || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Results</h1>

      <ScoreSummary score={result.score} correct={correct} total={questions.length} />
      <WeakTopics topics={weakTopics} />

      {/* Question review */}
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={q.id} className="bg-card border border-border rounded-lg p-6 space-y-3">
            {q.topic && (
              <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-md">
                {q.topic}
              </span>
            )}
            <p className="text-base text-card-foreground">{q.question_text}</p>
            <div className="space-y-2">
              {q.choices.map((choice, ci) => {
                const isCorrect = ci === q.correct_answer;
                const isUserAnswer = ci === q.user_answer;
                const isWrong = isUserAnswer && !isCorrect;

                let classes = "border-border text-card-foreground";
                if (isCorrect) classes = "border-success bg-success/5 text-card-foreground";
                if (isWrong) classes = "border-destructive bg-destructive/5 text-card-foreground";

                return (
                  <div
                    key={ci}
                    className={`flex items-center gap-2 p-3 rounded-md border text-sm ${classes}`}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + ci)}.</span>
                    <span className="flex-1">{choice}</span>
                    {isCorrect && <Check className="h-4 w-4 text-success" />}
                    {isWrong && <X className="h-4 w-4 text-destructive" />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleRetake}
          className="flex-1 py-2.5 bg-card border border-primary text-primary text-sm font-medium rounded-md hover:bg-primary/5 transition-colors duration-150 cursor-pointer"
        >
          Retake Same Quiz
        </button>
        <button
          onClick={() => navigate(`/sessions/${result.session_id}`)}
          className="flex-1 py-2.5 bg-primary text-on-primary text-sm font-medium rounded-md hover:opacity-90 transition-opacity duration-150 cursor-pointer"
        >
          Generate New Quiz
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={() => navigate(`/sessions/${result.session_id}`)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
        >
          Back to Session
        </button>
      </div>
    </div>
  );
}
```

Note: The Results page needs the quiz endpoint to return `correct_answer` and `weak_topics` for completed quizzes. Update `backend/app/routers/quizzes.py` `get_quiz` to return `QuizResult` when quiz is completed. This is addressed in a refinement step below.

- [ ] **Step 4: Update `get_quiz` endpoint to return full results for completed quizzes**

In `backend/app/routers/quizzes.py`, update the `get_quiz` endpoint to return `QuizResult` for completed quizzes (with correct answers and weak topics) or `QuizOut` for in-progress quizzes:

```python
@router.get("/quizzes/{quiz_id}", response_model=QuizResult | QuizOut)
def get_quiz(quiz_id: int, db: DBSession = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    if quiz.completed_at is not None:
        # Return full results with correct answers and weak topics
        question_dicts = [
            {"correct_answer": q.correct_answer, "user_answer": q.user_answer, "topic": q.topic}
            for q in quiz.questions
        ]
        weak_topics = grading_service.compute_weak_topics(question_dicts)
        return QuizResult(
            id=quiz.id,
            session_id=quiz.session_id,
            num_questions=quiz.num_questions,
            difficulty=quiz.difficulty,
            score=quiz.score,
            created_at=quiz.created_at,
            completed_at=quiz.completed_at,
            questions=quiz.questions,
            weak_topics=weak_topics,
        )

    return QuizOut.model_validate(quiz)
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ScoreSummary.jsx frontend/src/components/WeakTopics.jsx frontend/src/pages/ResultsPage.jsx backend/app/routers/quizzes.py
git commit -m "feat: add Results page with score summary, weak topics, and answer review"
```

---

## Task 16: History Page

**Files:**
- Create: `frontend/src/pages/HistoryPage.jsx`

Reference: `design-system/pages/history.md`

- [ ] **Step 1: Create `frontend/src/pages/HistoryPage.jsx`**

```jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listSessions } from "../api";

function scoreColor(score) {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-accent";
  return "text-destructive";
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      const data = await listSessions();
      setSessions(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Quiz History</h1>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground mb-4">No quiz history yet</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary text-on-primary text-sm font-medium rounded-md hover:opacity-90 transition-opacity duration-150 cursor-pointer"
          >
            Upload a file to get started
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="p-4 font-medium text-muted-foreground">Session</th>
                  <th className="p-4 font-medium text-muted-foreground">Material</th>
                  <th className="p-4 font-medium text-muted-foreground">Date</th>
                  <th className="p-4 font-medium text-muted-foreground">Best Score</th>
                  <th className="p-4 font-medium text-muted-foreground">Weak Topics</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/sessions/${s.id}`)}
                    className="border-b border-border last:border-0 hover:bg-muted cursor-pointer transition-colors duration-150"
                  >
                    <td className="p-4 text-card-foreground">{s.name}</td>
                    <td className="p-4 text-muted-foreground">{s.material_name}</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {s.best_score !== null ? (
                        <span className={`font-semibold ${scoreColor(s.best_score)}`}>
                          {s.best_score}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {s.weak_topics.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {s.weak_topics.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-md"
                            >
                              {t}
                            </span>
                          ))}
                          {s.weak_topics.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{s.weak_topics.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/sessions/${s.id}`)}
                className="bg-card border border-border rounded-lg p-4 space-y-2 cursor-pointer hover:bg-muted transition-colors duration-150"
              >
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-card-foreground">{s.name}</p>
                  {s.best_score !== null && (
                    <span className={`text-sm font-semibold ${scoreColor(s.best_score)}`}>
                      {s.best_score}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {s.material_name} · {new Date(s.created_at).toLocaleDateString()}
                </p>
                {s.weak_topics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {s.weak_topics.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-md"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/HistoryPage.jsx
git commit -m "feat: add History page with responsive table/card layout"
```

---

## Task 17: Integration Testing & Polish

**Files:**
- Modify: various files for fixes discovered during integration

- [ ] **Step 1: Install backend dependencies and run all backend tests**

```bash
cd backend && pip install -r requirements.txt && python -m pytest -v
```

Expected: All tests PASS.

- [ ] **Step 2: Install frontend dependencies and verify build**

```bash
cd frontend && npm install && npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Start backend and frontend locally to test end-to-end**

Terminal 1:
```bash
cd backend && uvicorn app.main:app --reload --port 8000
```

Terminal 2:
```bash
cd frontend && npm run dev
```

Manual test flow:
1. Open `http://localhost:3000`
2. Upload a PDF or PPTX file
3. Click material → creates session
4. Configure quiz (5 questions, easy) → generates quiz
5. Answer all questions → submit
6. View results with score and weak topics
7. Retake quiz → verify new quiz with same questions
8. Check History page shows the session

- [ ] **Step 4: Fix any issues found during integration testing**

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: integration test fixes and polish"
```

---

## Task 18: Docker Compose Verification

**Files:**
- Verify: `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`

- [ ] **Step 1: Create `.env` file for local testing**

```bash
cp .env.example .env
# Edit .env to add your OPENAI_API_KEY
```

- [ ] **Step 2: Build and run with Docker Compose**

```bash
docker compose up --build
```

Expected: Both services start. Frontend on `http://localhost:3000`, backend on `http://localhost:8000`.

- [ ] **Step 3: Run the same manual test flow from Task 17 against Docker**

- [ ] **Step 4: Commit any Docker-related fixes**

```bash
git add -A
git commit -m "fix: Docker Compose configuration fixes"
```
