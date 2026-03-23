from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import relationship

from app.database import Base


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, autoincrement=True)
    file_name = Column(String, nullable=False)  # Original filename for display
    stored_name = Column(String, nullable=False)  # UUID-prefixed filename on disk
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
