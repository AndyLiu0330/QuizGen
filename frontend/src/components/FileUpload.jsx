import { useState, useRef } from "react";
import { Upload } from "lucide-react";

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
        flex flex-col items-center justify-center min-h-[120px] rounded-lg border-2 border-dashed
        cursor-pointer transition-colors duration-150
        ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary hover:bg-muted"}
        ${isUploading ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">
        {isUploading ? "Uploading..." : "Drag files here or click to browse"}
      </p>
      <p className="text-xs text-muted-foreground mt-1">PDF, PPTX — Max 50MB</p>
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
