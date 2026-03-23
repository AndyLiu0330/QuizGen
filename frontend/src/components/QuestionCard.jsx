export default function QuestionCard({ question, index, total, selectedAnswer, onSelect }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      {question.topic && (
        <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-md">
          {question.topic}
        </span>
      )}
      <p className="text-sm font-medium text-card-foreground">
        Question {index + 1} of {total}
      </p>
      <p className="text-base text-card-foreground">{question.question_text}</p>
      <div className="space-y-2">
        {question.choices.map((choice, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(question.id, i)}
            className={`w-full text-left p-3 rounded-md border text-sm transition-colors duration-150 cursor-pointer ${
              selectedAnswer === i
                ? "border-primary bg-primary/5 text-card-foreground"
                : "border-border hover:bg-muted text-card-foreground"
            }`}
          >
            <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}
