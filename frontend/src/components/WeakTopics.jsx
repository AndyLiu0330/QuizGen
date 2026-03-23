import { AlertTriangle } from "lucide-react";

export default function WeakTopics({ topics }) {
  if (!topics || topics.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-base font-semibold text-card-foreground flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-accent" />
        Areas to Improve
      </h2>
      <ul className="space-y-1">
        {topics.map((topic) => (
          <li key={topic} className="text-sm text-muted-foreground">
            · {topic}
          </li>
        ))}
      </ul>
    </div>
  );
}
