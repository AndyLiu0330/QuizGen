import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Send } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading quiz...</p>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalCount = quiz.questions.length;
  const allAnswered = answeredCount === totalCount;
  const progress = (answeredCount / totalCount) * 100;

  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl font-700 text-foreground tracking-tight">Quiz</h1>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="capitalize">{quiz.difficulty}</span> · {quiz.num_questions} questions
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-right">{answeredCount}/{totalCount} answered</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
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
      <div className="fixed bottom-0 left-64 right-0 bg-surface-container/90 backdrop-blur-sm border-t border-outline-variant/10 p-4 z-10">
        <div className="mx-auto max-w-screen-2xl px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-0.5">
              {Array.from({ length: totalCount }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full border border-card transition-colors duration-200 ${
                    answers[quiz.questions[i]?.id] !== undefined ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {answeredCount} of {totalCount}
            </span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            className="px-6 py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-lg hover:brightness-110 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
