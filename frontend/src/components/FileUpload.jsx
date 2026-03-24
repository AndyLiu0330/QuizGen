import { useState, useRef } from "react";
import { Upload, FileUp, Loader2 } from "lucide-react";

export default function FileUpload({ onUpload, isUploading }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  }

  function handleClick() {
    inputRef.current?.click();
  }

  function handleChange(e) {
    const file = e.target.files[0];
    if (file) onUpload(file);
    e.target.value = "";
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        relative flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed
        cursor-pointer transition-all duration-300
        ${isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-low"
        }
        ${isUploading ? "opacity-60 pointer-events-none" : ""}
      `}
    >
      <div className={`
        flex items-center justify-center w-10 h-10 rounded-full mb-3 transition-all duration-300
        ${isDragging ? "bg-primary/10 text-primary scale-110" : "bg-surface-container-high text-secondary"}
      `}>
        {isUploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isDragging ? (
          <FileUp className="h-5 w-5" />
        ) : (
          <Upload className="h-5 w-5" />
        )}
      </div>
      <p className="text-sm font-medium text-on-surface">
        {isUploading ? "Uploading..." : "Drop file or browse"}
      </p>
      <p className="text-[10px] text-secondary mt-1">
        PDF, PPTX up to 50 MB
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.pptx"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
