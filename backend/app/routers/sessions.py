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
        completed_quizzes = [q for q in session.quizzes if q.score is not None]
        best_score = max((q.score for q in completed_quizzes), default=None)

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
