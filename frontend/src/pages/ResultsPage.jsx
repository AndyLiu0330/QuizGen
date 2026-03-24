import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, X, RotateCcw, Sparkles, ArrowLeft } from "lucide-react";
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
    return (
      <div className="p-3.5 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive text-sm font-medium">
        {error}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const questions = result.questions || [];
  const correct = questions.filter((q) => q.user_answer === q.correct_answer).length;
  const weakTopics = result.weak_topics || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="font-serif text-3xl font-700 text-foreground tracking-tight">Results</h1>

      <ScoreSummary score={result.score} correct={correct} total={questions.length} />
      <WeakTopics topics={weakTopics} />

      {/* Question review */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-700 text-foreground">Question Review</h2>
        {questions.map((q, i) => (
          <div
            key={q.id}
            className="bg-card border border-border rounded-xl p-6 space-y-4 animate-slide-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center justify-between">
              {q.topic && (
                <span className="text-xs font-medium px-2.5 py-1 bg-primary/8 text-primary rounded-full">
                  {q.topic}
                </span>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {i + 1}/{questions.length}
              </span>
            </div>

            <p className="font-serif text-lg font-500 text-card-foreground leading-relaxed">
              {q.question_text}
            </p>

            <div className="space-y-2">
              {q.choices.map((choice, ci) => {
                const isCorrect = ci === q.correct_answer;
                const isUserAnswer = ci === q.user_answer;
                const isWrong = isUserAnswer && !isCorrect;

                let classes = "border-border text-card-foreground";
                if (isCorrect) classes = "border-success/50 bg-success/5 text-card-foreground";
                if (isWrong) classes = "border-destructive/50 bg-destructive/5 text-card-foreground";

                return (
                  <div
                    key={ci}
                    className={`flex items-center gap-3 p-3.5 rounded-lg border text-sm transition-colors ${classes}`}
                  >
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold shrink-0 ${
                      isCorrect ? "bg-success/15 text-success" :
                      isWrong ? "bg-destructive/15 text-destructive" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {String.fromCharCode(65 + ci)}
                    </span>
                    <span className="flex-1">{choice}</span>
                    {isCorrect && <Check className="h-4 w-4 text-success shrink-0" />}
                    {isWrong && <X className="h-4 w-4 text-destructive shrink-0" />}
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
          className="flex-1 py-3 bg-card border border-border text-foreground text-sm font-semibold rounded-xl hover:bg-muted transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Retake Same Quiz
        </button>
        <button
          onClick={() => navigate(`/sessions/${result.session_id}`)}
          className="flex-1 py-3 bg-primary text-on-primary text-sm font-semibold rounded-xl hover:brightness-110 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
        >
          <Sparkles className="h-4 w-4" />
          Generate New Quiz
        </button>
      </div>

      <div className="text-center pb-4">
        <button
          onClick={() => navigate(`/sessions/${result.session_id}`)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Session
        </button>
      </div>
    </div>
  );
}
