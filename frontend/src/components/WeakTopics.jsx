import { AlertTriangle } from "lucide-react";

export default function WeakTopics({ topics }) {
  if (!topics || topics.length === 0) return null;

  return (
    <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
      <h2 className="text-base font-serif font-700 text-card-foreground flex items-center gap-2.5 mb-4">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-accent/10 text-accent">
          <AlertTriangle className="h-3.5 w-3.5" />
        </div>
        Areas to Improve
      </h2>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span
            key={topic}
            className="text-sm px-3 py-1.5 bg-card border border-accent/15 text-card-foreground rounded-full"
          >
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
}
