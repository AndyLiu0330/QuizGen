from collections import defaultdict


class GradingService:
    def calculate_score(self, questions: list[dict]) -> float:
        """Calculate score as percentage of correct answers."""
        if not questions:
            return 0.0
        correct = sum(
            1 for q in questions if q["correct_answer"] == q["user_answer"]
        )
        return round((correct / len(questions)) * 100, 1)

    def compute_weak_topics(self, questions: list[dict]) -> list[str]:
        """Return topics where accuracy is below 50%."""
        topic_stats: dict[str, dict] = defaultdict(lambda: {"correct": 0, "total": 0})

        for q in questions:
            topic = q["topic"]
            topic_stats[topic]["total"] += 1
            if q["correct_answer"] == q["user_answer"]:
                topic_stats[topic]["correct"] += 1

        weak = []
        for topic, stats in topic_stats.items():
            accuracy = stats["correct"] / stats["total"]
            if accuracy < 0.5:
                weak.append(topic)

        return sorted(weak)
