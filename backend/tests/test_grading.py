from app.services.grading import GradingService


def test_calculate_score_all_correct():
    questions = [
        {"correct_answer": 0, "user_answer": 0, "topic": "Math"},
        {"correct_answer": 2, "user_answer": 2, "topic": "Science"},
    ]
    service = GradingService()
    assert service.calculate_score(questions) == 100.0


def test_calculate_score_half_correct():
    questions = [
        {"correct_answer": 0, "user_answer": 0, "topic": "Math"},
        {"correct_answer": 2, "user_answer": 1, "topic": "Science"},
    ]
    service = GradingService()
    assert service.calculate_score(questions) == 50.0


def test_calculate_score_none_correct():
    questions = [
        {"correct_answer": 0, "user_answer": 1, "topic": "Math"},
        {"correct_answer": 2, "user_answer": 3, "topic": "Science"},
    ]
    service = GradingService()
    assert service.calculate_score(questions) == 0.0


def test_compute_weak_topics():
    questions = [
        {"correct_answer": 0, "user_answer": 0, "topic": "Math"},
        {"correct_answer": 1, "user_answer": 1, "topic": "Math"},
        {"correct_answer": 2, "user_answer": 0, "topic": "Science"},
        {"correct_answer": 1, "user_answer": 0, "topic": "Science"},
    ]
    service = GradingService()
    weak = service.compute_weak_topics(questions)
    assert "Science" in weak
    assert "Math" not in weak


def test_compute_weak_topics_threshold():
    # 1 out of 2 correct = 50%, which is NOT weak (threshold is < 50%)
    questions = [
        {"correct_answer": 0, "user_answer": 0, "topic": "History"},
        {"correct_answer": 1, "user_answer": 2, "topic": "History"},
    ]
    service = GradingService()
    weak = service.compute_weak_topics(questions)
    assert "History" not in weak
