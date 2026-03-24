import { FileText, Presentation, Trash2, MoreVertical } from "lucide-react";

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
  const isPdf = material.file_type === "pdf";
  const Icon = isPdf ? FileText : Presentation;

  return (
    <div
      onClick={onClick}
      className="bg-surface-container hover:bg-surface-container-high transition-colors p-6 rounded-lg flex items-center justify-between group cursor-pointer"
    >
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 rounded bg-surface-container-highest flex items-center justify-center">
          <Icon className="h-5 w-5 text-secondary" />
        </div>
        <div>
          <h4 className="text-on-surface font-medium text-lg">{material.file_name}</h4>
          <p className="text-secondary text-sm">
            {material.file_type.toUpperCase()} &middot; {formatFileSize(material.file_size)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right hidden sm:block">
          <p className="text-secondary text-xs uppercase tracking-tighter mb-1">Uploaded</p>
          <p className="text-on-surface-variant text-sm">{formatDate(material.upload_date)}</p>
        </div>
        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] uppercase tracking-widest font-bold border border-primary/20 rounded">
          Ready
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(material.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-secondary hover:text-destructive transition-all"
          aria-label={`Delete ${material.file_name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
