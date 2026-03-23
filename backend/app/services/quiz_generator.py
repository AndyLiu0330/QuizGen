import json

from openai import AsyncOpenAI


class QuizGeneratorService:
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model

    def build_prompt(self, text: str, num_questions: int, difficulty: str) -> str:
        difficulty_guide = {
            "easy": "recall and basic understanding",
            "medium": "understanding and application",
            "hard": "application, analysis, and critical thinking",
        }
        level = difficulty_guide.get(difficulty, "understanding")

        return f"""Generate exactly {num_questions} multiple-choice questions from the following text.
Difficulty level: {difficulty} — focus on {level}.

For each question, provide:
- "question": the question text
- "topic": a short topic/section label derived from the source material
- "choices": exactly 4 answer options
- "correct_answer": the index (0-3) of the correct choice

Return ONLY valid JSON in this exact format:
{{
  "questions": [
    {{
      "question": "...",
      "topic": "...",
      "choices": ["A", "B", "C", "D"],
      "correct_answer": 0
    }}
  ]
}}

Source text:
{text}"""

    def parse_response(self, response_text: str) -> list[dict]:
        """Parse and validate the AI response JSON."""
        try:
            data = json.loads(response_text)
        except json.JSONDecodeError:
            raise ValueError("Invalid response format: not valid JSON")

        if "questions" not in data or not isinstance(data["questions"], list):
            raise ValueError("Invalid response format: missing questions array")

        questions = []
        for q in data["questions"]:
            if not all(k in q for k in ("question", "topic", "choices", "correct_answer")):
                raise ValueError("Invalid response format: missing required fields")
            if not isinstance(q["choices"], list) or len(q["choices"]) != 4:
                raise ValueError("Invalid response format: choices must be array of 4")
            if not isinstance(q["correct_answer"], int) or q["correct_answer"] not in range(4):
                raise ValueError("Invalid response format: correct_answer must be 0-3")

            questions.append({
                "question_text": q["question"],
                "topic": q["topic"],
                "choices": q["choices"],
                "correct_answer": q["correct_answer"],
            })

        return questions

    async def generate(self, text: str, num_questions: int, difficulty: str) -> list[dict]:
        """Call OpenAI API to generate quiz questions."""
        prompt = self.build_prompt(text, num_questions, difficulty)

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a quiz question generator. Return only valid JSON."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content
        return self.parse_response(content)
