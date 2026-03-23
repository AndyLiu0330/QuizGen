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
