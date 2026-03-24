export default function QuestionCard({ question, index, total, selectedAnswer, onSelect }) {
  return (
    <div
      className="bg-card border border-border rounded-xl p-6 space-y-4 animate-slide-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-center justify-between">
        {question.topic && (
          <span className="text-xs font-medium px-2.5 py-1 bg-primary/8 text-primary rounded-full">
            {question.topic}
          </span>
        )}
        <span className="text-xs text-muted-foreground font-medium ml-auto">
          {index + 1}/{total}
        </span>
      </div>

      <p className="font-serif text-lg font-500 text-card-foreground leading-relaxed">
        {question.question_text}
      </p>

      <div className="space-y-2">
        {question.choices.map((choice, i) => {
          const isSelected = selectedAnswer === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(question.id, i)}
              className={`w-full text-left p-3.5 rounded-lg border text-sm transition-all duration-200 cursor-pointer group ${
                isSelected
                  ? "border-primary bg-primary/5 text-card-foreground shadow-sm"
                  : "border-border hover:border-primary/30 hover:bg-muted/50 text-card-foreground"
              }`}
            >
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold mr-3 transition-all duration-200 ${
                isSelected
                  ? "bg-primary text-on-primary"
                  : "bg-muted text-muted-foreground group-hover:bg-border"
              }`}>
                {String.fromCharCode(65 + i)}
              </span>
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}
