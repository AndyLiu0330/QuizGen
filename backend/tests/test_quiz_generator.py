import json
import pytest
from unittest.mock import MagicMock, patch

from app.services.quiz_generator import QuizGeneratorService


VALID_AI_RESPONSE = json.dumps({
    "questions": [
        {
            "question": "What is the capital of France?",
            "topic": "Geography",
            "choices": ["London", "Paris", "Berlin", "Madrid"],
            "correct_answer": 1,
        },
        {
            "question": "What is 2+2?",
            "topic": "Math",
            "choices": ["3", "4", "5", "6"],
            "correct_answer": 1,
        },
    ]
})


def test_build_prompt_contains_text_and_params():
    service = QuizGeneratorService(api_key="test-key", model="gpt-4o")
    prompt = service.build_prompt(
        text="Python is a programming language.",
        num_questions=5,
        difficulty="easy",
    )
    assert "Python is a programming language." in prompt
    assert "5" in prompt
    assert "easy" in prompt


def test_parse_response_valid():
    service = QuizGeneratorService(api_key="test-key", model="gpt-4o")
    questions = service.parse_response(VALID_AI_RESPONSE)
    assert len(questions) == 2
    assert questions[0]["question_text"] == "What is the capital of France?"
    assert questions[0]["topic"] == "Geography"
    assert questions[0]["choices"] == ["London", "Paris", "Berlin", "Madrid"]
    assert questions[0]["correct_answer"] == 1


def test_parse_response_invalid_json():
    service = QuizGeneratorService(api_key="test-key", model="gpt-4o")
    with pytest.raises(ValueError, match="Invalid response format"):
        service.parse_response("not json at all")


def test_parse_response_missing_fields():
    service = QuizGeneratorService(api_key="test-key", model="gpt-4o")
    bad_response = json.dumps({"questions": [{"question": "Q?"}]})
    with pytest.raises(ValueError, match="Invalid response format"):
        service.parse_response(bad_response)


def test_parse_response_invalid_correct_answer():
    service = QuizGeneratorService(api_key="test-key", model="gpt-4o")
    bad_response = json.dumps({
        "questions": [
            {
                "question": "Q?",
                "topic": "T",
                "choices": ["A", "B", "C", "D"],
                "correct_answer": 5,  # Out of range
            }
        ]
    })
    with pytest.raises(ValueError, match="Invalid response format"):
        service.parse_response(bad_response)
