from pathlib import Path

from markitdown import MarkItDown


ALLOWED_EXTENSIONS = {"pdf", "pptx"}


class FileParserService:
    def __init__(self, max_size_mb: int = 50):
        self.max_size_bytes = max_size_mb * 1024 * 1024
        self.converter = MarkItDown()

    def get_file_extension(self, filename: str) -> str:
        return Path(filename).suffix.lstrip(".").lower()

    def validate_file_type(self, filename: str) -> bool:
        ext = self.get_file_extension(filename)
        return ext in ALLOWED_EXTENSIONS

    def validate_file_size(self, size_bytes: int) -> bool:
        return size_bytes <= self.max_size_bytes

    def parse_file(self, file_path: str) -> str:
        """Parse a PDF or PPTX file and return extracted text as markdown."""
        result = self.converter.convert(file_path)
        return result.text_content
