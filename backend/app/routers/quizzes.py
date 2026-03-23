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
