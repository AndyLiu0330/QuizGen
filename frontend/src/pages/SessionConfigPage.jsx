import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSession, generateQuiz, deleteQuiz } from "../api";
import { Trash2, ArrowRight, Clock } from "lucide-react";
import QuizConfigForm from "../components/QuizConfigForm";

function scoreColor(score) {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-accent";
  return "text-destructive";
}

function scoreBg(score) {
  if (score >= 70) return "bg-success/8";
  if (score >= 40) return "bg-accent/8";
  return "bg-destructive/8";
}

export default function SessionConfigPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSession();
  }, [id]);

  async function loadSession() {
    try {
      const data = await getSession(id);
      setSession(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGenerate(numQuestions, difficulty) {
    setError(null);
    setIsGenerating(true);
    try {
      const quiz = await generateQuiz(session.id, numQuestions, difficulty);
      navigate(`/quizzes/${quiz.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDeleteQuiz(e, quizId) {
    e.stopPropagation();
    if (!window.confirm("Delete this quiz? This cannot be undone.")) return;
    try {
      await deleteQuiz(quizId);
      await loadSession();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl font-700 text-foreground tracking-tight">
          {session.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {session.material.file_name} · {session.material.file_type.toUpperCase()}
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      <QuizConfigForm onGenerate={handleGenerate} isGenerating={isGenerating} />

      <div className="space-y-4">
        <h2 className="font-serif text-xl font-700 text-foreground">Previous Quizzes</h2>
        {session.quizzes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No quizzes yet — generate your first one above
          </p>
        ) : (
          <div className="space-y-3">
            {session.quizzes.map((quiz, i) => (
              <div
                key={quiz.id}
                onClick={() =>
                  navigate(quiz.completed_at ? `/quizzes/${quiz.id}/results` : `/quizzes/${quiz.id}`)
                }
                className="group flex items-center justify-between p-4 bg-card border border-border rounded-xl cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-card-foreground">
                    <span className="capitalize">{quiz.difficulty}</span> · {quiz.num_questions} questions
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(quiz.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {quiz.score !== null ? (
                    <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${scoreColor(quiz.score)} ${scoreBg(quiz.score)}`}>
                      {quiz.score}%
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2.5 py-1 bg-muted text-muted-foreground rounded-full">
                      In Progress
                    </span>
                  )}
                  <button
                    onClick={(e) => handleDeleteQuiz(e, quiz.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Delete quiz"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
