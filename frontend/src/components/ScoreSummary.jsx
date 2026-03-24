import { Trophy, TrendingUp, AlertCircle } from "lucide-react";

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

function ScoreIcon({ score }) {
  if (score >= 70) return <Trophy className="h-5 w-5" />;
  if (score >= 40) return <TrendingUp className="h-5 w-5" />;
  return <AlertCircle className="h-5 w-5" />;
}

function scoreLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Great job";
  if (score >= 50) return "Good effort";
  if (score >= 30) return "Keep practicing";
  return "Try again";
}

export default function ScoreSummary({ score, correct, total }) {
  return (
    <div className="bg-card border border-border rounded-xl p-8 text-center space-y-3 animate-scale-in">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${scoreBg(score)} ${scoreColor(score)}`}>
        <ScoreIcon score={score} />
      </div>
      <p className={`font-serif text-6xl font-900 tracking-tight ${scoreColor(score)}`}>
        {score}%
      </p>
      <p className="text-sm text-muted-foreground">
        {correct} out of {total} correct
      </p>
      <p className={`text-sm font-medium ${scoreColor(score)}`}>
        {scoreLabel(score)}
      </p>
    </div>
  );
}
