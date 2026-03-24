import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Clock, ArrowRight } from "lucide-react";
import { listSessions } from "../api";

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
    <div className="space-y-8 animate-fade-in">
      <h1 className="font-serif text-3xl font-700 text-foreground tracking-tight">Quiz History</h1>

      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <Clock className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm mb-5">No quiz history yet</p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-lg hover:brightness-110 transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <Upload className="h-4 w-4" />
            Upload a file to get started
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Session</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Material</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Best Score</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weak Topics</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/sessions/${s.id}`)}
                    className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors duration-200 group"
                  >
                    <td className="p-4 font-medium text-card-foreground">{s.name}</td>
                    <td className="p-4 text-muted-foreground">{s.material_name}</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {s.best_score !== null ? (
                        <span className={`font-bold px-2 py-0.5 rounded-md ${scoreColor(s.best_score)} ${scoreBg(s.best_score)}`}>
                          {s.best_score}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {s.weak_topics.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {s.weak_topics.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-xs px-2 py-0.5 bg-accent/8 text-accent border border-accent/15 rounded-full"
                            >
                              {t}
                            </span>
                          ))}
                          {s.weak_topics.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{s.weak_topics.length - 3}
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
            {sessions.map((s, i) => (
              <div
                key={s.id}
                onClick={() => navigate(`/sessions/${s.id}`)}
                className="group bg-card border border-border rounded-xl p-4 space-y-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.material_name} · {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.best_score !== null && (
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-md ${scoreColor(s.best_score)} ${scoreBg(s.best_score)}`}>
                        {s.best_score}%
                      </span>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </div>
                {s.weak_topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {s.weak_topics.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-0.5 bg-accent/8 text-accent border border-accent/15 rounded-full"
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
