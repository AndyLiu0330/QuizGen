from datetime import datetime, timezone

from app.models import Material, Session as SessionModel, Quiz, Question


def _seed_material(db):
    """Helper to insert a material directly into the DB."""
    m = Material(
        file_name="test.pdf",
        stored_name="abc123_test.pdf",
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
