import { useCallback, useState } from "react";
import { Upload, Files } from "lucide-react";
import { cn } from "@/lib/utils";

type FileUploadProps = {
  description?: string;
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
};

export function FileUpload({ description, onFiles, accept, multiple = true, className }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const files = Array.from(fileList);
      if (files.length) onFiles(files);
    },
    [onFiles]
  );

  return (
    <label
      className={cn(
        "flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-[rgb(var(--border))] bg-white/60 text-center text-sm text-[rgb(var(--text)/0.65)] shadow-inner transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] dark:bg-white/5",
        dragActive && "border-[color:var(--brand)] bg-[color:var(--brand)]/10",
        className
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setDragActive(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);
        handleFiles(event.dataTransfer.files);
      }}
    >
      <Upload className="h-6 w-6 text-[color:var(--brand)]" />
      <div className="max-w-[260px] text-sm font-medium">
        {description || "Drag & drop or click to upload"}
      </div>
      <span className="text-[11px] uppercase tracking-[0.18em] text-[rgb(var(--text)/0.45)]">
        {multiple ? "Multiple files" : "Single file"}
      </span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </label>
  );
}

export function InlineFileBadge({ file, onRemove }: { file: File; onRemove?: () => void }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-[rgba(0,133,255,0.25)] bg-[rgba(0,133,255,0.08)] px-3 py-2 text-xs font-medium text-[color:var(--brand)] backdrop-blur">
      <Files className="h-4 w-4" />
      <span className="max-w-[160px] truncate">{file.name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-[rgb(var(--text)/0.45)] transition hover:text-red-500"
          aria-label="Remove file"
        >
          ✕
        </button>
      )}
    </div>
  );
}
