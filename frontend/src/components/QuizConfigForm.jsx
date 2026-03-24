import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

const NUM_OPTIONS = [5, 10, 15, 20];
const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"];

export default function QuizConfigForm({ onGenerate, isGenerating }) {
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");

  function handleSubmit(e) {
    e.preventDefault();
    onGenerate(numQuestions, difficulty);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6">
      <h2 className="font-serif font-700 text-xl text-card-foreground">Generate New Quiz</h2>

      <div className="space-y-2.5">
        <label className="text-sm font-medium text-card-foreground">Questions</label>
        <div className="flex gap-2">
          {NUM_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNumQuestions(n)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                numQuestions === n
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-muted text-card-foreground hover:bg-border"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <label className="text-sm font-medium text-card-foreground">Difficulty</label>
        <div className="flex gap-2">
          {DIFFICULTY_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg capitalize transition-all duration-200 cursor-pointer ${
                difficulty === d
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-muted text-card-foreground hover:bg-border"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isGenerating}
        className="w-full py-3 bg-primary text-on-primary text-sm font-semibold rounded-lg hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-sm"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {isGenerating ? "Generating..." : "Generate Quiz"}
      </button>
    </form>
  );
}
