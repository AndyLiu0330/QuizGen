from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str = "test-key-not-set"
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4o"
    database_url: str = "sqlite:///db/quizgen.db"
    max_upload_size_mb: int = 50

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


def get_settings() -> Settings:
    return Settings()


settings = get_settings()
