import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app


@pytest.fixture
def test_db():
    """In-memory SQLite DB session, shared connection so all sessions see same data."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )
    connection = engine.connect()
    Base.metadata.create_all(bind=connection)
    TestSession = sessionmaker(autocommit=False, autoflush=False, bind=connection)
    session = TestSession()
    yield session
    session.close()
    Base.metadata.drop_all(bind=connection)
    connection.close()


@pytest.fixture
def db_session(test_db):
    """Alias for test_db for backwards compatibility."""
    yield test_db


@pytest.fixture
def test_app(test_db):
    """FastAPI test client with overridden DB dependency using the same connection as test_db."""

    def override_get_db():
        yield test_db

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()
