import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import { getQuiz, retakeQuiz } from "../api";
import ScoreSummary from "../components/ScoreSummary";
import WeakTopics from "../components/WeakTopics";

export default function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResults();
  }, [id]);

  async function loadResults() {
    try {
      const data = await getQuiz(id);
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRetake() {
    try {
      const newQuiz = await retakeQuiz(id);
      navigate(`/quizzes/${newQuiz.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) {
    return <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>;
  }

  if (!result) return <div className="text-muted-foreground">Loading...</div>;

  const questions = result.questions || [];
  const correct = questions.filter((q) => q.user_answer === q.correct_answer).length;
  const weakTopics = result.weak_topics || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Results</h1>

      <ScoreSummary score={result.score} correct={correct} total={questions.length} />
      <WeakTopics topics={weakTopics} />

      {/* Question review */}
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={q.id} className="bg-card border border-border rounded-lg p-6 space-y-3">
            {q.topic && (
              <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-md">
                {q.topic}
              </span>
            )}
            <p className="text-base text-card-foreground">{q.question_text}</p>
            <div className="space-y-2">
              {q.choices.map((choice, ci) => {
                const isCorrect = ci === q.correct_answer;
                const isUserAnswer = ci === q.user_answer;
                const isWrong = isUserAnswer && !isCorrect;

                let classes = "border-border text-card-foreground";
                if (isCorrect) classes = "border-success bg-success/5 text-card-foreground";
                if (isWrong) classes = "border-destructive bg-destructive/5 text-card-foreground";

                return (
                  <div
                    key={ci}
                    className={`flex items-center gap-2 p-3 rounded-md border text-sm ${classes}`}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + ci)}.</span>
                    <span className="flex-1">{choice}</span>
                    {isCorrect && <Check className="h-4 w-4 text-success" />}
                    {isWrong && <X className="h-4 w-4 text-destructive" />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleRetake}
          className="flex-1 py-2.5 bg-card border border-primary text-primary text-sm font-medium rounded-md hover:bg-primary/5 transition-colors duration-150 cursor-pointer"
        >
          Retake Same Quiz
        </button>
        <button
          onClick={() => navigate(`/sessions/${result.session_id}`)}
          className="flex-1 py-2.5 bg-primary text-on-primary text-sm font-medium rounded-md hover:opacity-90 transition-opacity duration-150 cursor-pointer"
        >
          Generate New Quiz
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={() => navigate(`/sessions/${result.session_id}`)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
        >
          Back to Session
        </button>
      </div>
    </div>
  );
}
