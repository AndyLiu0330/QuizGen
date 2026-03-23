import { FileText, Presentation, Trash2 } from "lucide-react";

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MaterialCard({ material, onClick, onDelete }) {
  const Icon = material.file_type === "pdf" ? FileText : Presentation;

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-4 p-4 bg-card border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors duration-150"
    >
      <Icon className="h-8 w-8 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-card-foreground truncate">{material.file_name}</p>
        <p className="text-xs text-muted-foreground">
          {material.file_type.toUpperCase()} · {formatFileSize(material.file_size)} · {formatDate(material.upload_date)}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(material.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all duration-150 cursor-pointer"
        aria-label={`Delete ${material.file_name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
