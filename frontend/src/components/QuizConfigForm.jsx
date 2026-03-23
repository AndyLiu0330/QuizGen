import { useState } from "react";
import { Loader2 } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-5">
      <h2 className="text-lg font-semibold text-card-foreground">Generate New Quiz</h2>

      <div className="space-y-2">
        <label className="text-sm font-medium text-card-foreground">Number of Questions</label>
        <div className="flex gap-1">
          {NUM_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNumQuestions(n)}
              className={`flex-1 py-2 text-sm rounded-md transition-colors duration-150 cursor-pointer ${
                numQuestions === n
                  ? "bg-primary text-on-primary"
                  : "bg-muted text-card-foreground hover:bg-border"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-card-foreground">Difficulty</label>
        <div className="flex gap-1">
          {DIFFICULTY_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`flex-1 py-2 text-sm rounded-md capitalize transition-colors duration-150 cursor-pointer ${
                difficulty === d
                  ? "bg-primary text-on-primary"
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
        className="w-full py-2.5 bg-primary text-on-primary text-sm font-medium rounded-md hover:opacity-90 transition-opacity duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
      >
        {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
        {isGenerating ? "Generating..." : "Generate Quiz"}
      </button>
    </form>
  );
}
