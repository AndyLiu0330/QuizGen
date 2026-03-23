import tempfile
import os

from app.services.file_parser import FileParserService


def _create_minimal_pdf(path: str, text: str = "Hello PDF") -> None:
    """Create a minimal valid PDF file for testing."""
    # Minimal PDF 1.4 with a single page containing text
    content = (
        "%PDF-1.4\n"
        "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]"
        "/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n"
        f"4 0 obj<</Length {28 + len(text)}>>\nstream\n"
        f"BT /F1 12 Tf 100 700 Td ({text}) Tj ET\n"
        "endstream\nendobj\n"
        "5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n"
        "xref\n0 6\n"
        "0000000000 65535 f \n"
        "0000000009 00000 n \n"
        "0000000058 00000 n \n"
        "0000000115 00000 n \n"
        "0000000266 00000 n \n"
        "0000000360 00000 n \n"
        "trailer<</Size 6/Root 1 0 R>>\n"
        "startxref\n431\n%%EOF"
    )
    with open(path, "w") as f:
        f.write(content)


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


def test_parse_pdf_file():
    """Verify PDF parsing works (requires markitdown[pdf] dependencies)."""
    service = FileParserService()
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
        tmp_path = f.name
    try:
        _create_minimal_pdf(tmp_path, "Machine Learning Basics")
        text = service.parse_file(tmp_path)
        assert isinstance(text, str)
        assert "Machine Learning Basics" in text
    finally:
        os.unlink(tmp_path)
