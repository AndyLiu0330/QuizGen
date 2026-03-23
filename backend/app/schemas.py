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
