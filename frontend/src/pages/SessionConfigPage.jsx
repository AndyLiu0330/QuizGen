import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSession, generateQuiz } from "../api";
import QuizConfigForm from "../components/QuizConfigForm";

function scoreColor(score) {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-accent";
  return "text-destructive";
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

  if (!session) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{session.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {session.material.file_name} · {session.material.file_type.toUpperCase()}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <QuizConfigForm onGenerate={handleGenerate} isGenerating={isGenerating} />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Previous Quizzes</h2>
        {session.quizzes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No quizzes yet — generate your first one above
          </p>
        ) : (
          session.quizzes.map((quiz) => (
            <div
              key={quiz.id}
              onClick={() =>
                navigate(quiz.completed_at ? `/quizzes/${quiz.id}/results` : `/quizzes/${quiz.id}`)
              }
              className="flex items-center justify-between p-4 bg-card border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors duration-150"
            >
              <div>
                <p className="text-sm font-medium text-card-foreground">
                  Quiz #{quiz.id} · <span className="capitalize">{quiz.difficulty}</span> · {quiz.num_questions} questions
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(quiz.created_at).toLocaleDateString()}
                </p>
              </div>
              {quiz.score !== null ? (
                <span className={`text-sm font-semibold ${scoreColor(quiz.score)}`}>
                  {quiz.score}%
                </span>
              ) : (
                <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md">
                  In Progress
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
