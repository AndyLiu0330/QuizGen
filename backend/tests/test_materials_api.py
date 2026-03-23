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
