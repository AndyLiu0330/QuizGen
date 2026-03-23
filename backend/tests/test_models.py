from datetime import datetime, timezone

from app.models import Material, Session, Quiz, Question


def test_create_material(db_session):
    material = Material(
        file_name="test.pdf",
        stored_name="abc123_test.pdf",
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
        stored_name="abc123_test.pdf",
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
        stored_name="abc123_test.pdf",
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
