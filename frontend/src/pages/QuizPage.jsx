import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getQuiz, submitQuiz } from "../api";
import QuestionCard from "../components/QuestionCard";

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [id]);

  async function loadQuiz() {
    try {
      const data = await getQuiz(id);
      if (data.completed_at) {
        navigate(`/quizzes/${id}/results`, { replace: true });
        return;
      }
      setQuiz(data);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleSelect(questionId, choiceIndex) {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceIndex }));
  }

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await submitQuiz(id, answers);
      navigate(`/quizzes/${id}/results`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading quiz...</p>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalCount = quiz.questions.length;
  const allAnswered = answeredCount === totalCount;

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quiz</h1>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="capitalize">{quiz.difficulty}</span> · {quiz.num_questions} questions
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(answeredCount / totalCount) * 100}%` }}
        />
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <div className="space-y-4">
        {quiz.questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={i}
            total={totalCount}
            selectedAnswer={answers[q.id]}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Sticky submit bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {answeredCount} of {totalCount} answered
          </span>
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            className="px-6 py-2.5 bg-primary text-on-primary text-sm font-medium rounded-md hover:opacity-90 transition-opacity duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
