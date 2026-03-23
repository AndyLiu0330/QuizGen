function scoreColor(score) {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-accent";
  return "text-destructive";
}

export default function ScoreSummary({ score, correct, total }) {
  return (
    <div className="bg-card border border-border rounded-lg p-8 text-center">
      <p className={`text-5xl font-bold ${scoreColor(score)}`}>{score}%</p>
      <p className="text-sm text-muted-foreground mt-2">
        {correct} out of {total} correct
      </p>
    </div>
  );
}
