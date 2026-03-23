import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listSessions } from "../api";

function scoreColor(score) {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-accent";
  return "text-destructive";
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      const data = await listSessions();
      setSessions(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Quiz History</h1>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground mb-4">No quiz history yet</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary text-on-primary text-sm font-medium rounded-md hover:opacity-90 transition-opacity duration-150 cursor-pointer"
          >
            Upload a file to get started
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="p-4 font-medium text-muted-foreground">Session</th>
                  <th className="p-4 font-medium text-muted-foreground">Material</th>
                  <th className="p-4 font-medium text-muted-foreground">Date</th>
                  <th className="p-4 font-medium text-muted-foreground">Best Score</th>
                  <th className="p-4 font-medium text-muted-foreground">Weak Topics</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/sessions/${s.id}`)}
                    className="border-b border-border last:border-0 hover:bg-muted cursor-pointer transition-colors duration-150"
                  >
                    <td className="p-4 text-card-foreground">{s.name}</td>
                    <td className="p-4 text-muted-foreground">{s.material_name}</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {s.best_score !== null ? (
                        <span className={`font-semibold ${scoreColor(s.best_score)}`}>
                          {s.best_score}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {s.weak_topics.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {s.weak_topics.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-md"
                            >
                              {t}
                            </span>
                          ))}
                          {s.weak_topics.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{s.weak_topics.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/sessions/${s.id}`)}
                className="bg-card border border-border rounded-lg p-4 space-y-2 cursor-pointer hover:bg-muted transition-colors duration-150"
              >
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-card-foreground">{s.name}</p>
                  {s.best_score !== null && (
                    <span className={`text-sm font-semibold ${scoreColor(s.best_score)}`}>
                      {s.best_score}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {s.material_name} · {new Date(s.created_at).toLocaleDateString()}
                </p>
                {s.weak_topics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {s.weak_topics.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-md"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
