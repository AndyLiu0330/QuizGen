from datetime import datetime, timezone
from unittest.mock import patch, AsyncMock

from app.models import Material, Session as SessionModel, Quiz, Question


def _seed_session(db):
    material = Material(
        file_name="test.pdf",
        stored_name="abc123_test.pdf",
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
