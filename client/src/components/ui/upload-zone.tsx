import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileImage, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFilesSelected: (files: FileList) => void;
  className?: string;
  disabled?: boolean;
}

export function UploadZone({ onFilesSelected, className, disabled }: UploadZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const fileList = new DataTransfer();
      acceptedFiles.forEach(file => fileList.items.add(file));
      onFilesSelected(fileList.files);
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: true,
    disabled
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive && "border-blue-500 bg-blue-50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {isDragActive ? (
          <>
            <FileImage className="w-12 h-12 text-blue-500" />
            <p className="text-blue-600 font-medium">Drop receipt images here</p>
          </>
        ) : (
          <>
            <Upload className="w-12 h-12 text-slate-400" />
            <div>
              <p className="text-slate-600 font-medium mb-1">
                Drag & drop receipt images here, or click to select
              </p>
              <p className="text-sm text-slate-500">
                Supports PNG, JPG, JPEG, GIF, WebP (max 10MB each)
              </p>
            </div>
          </>
        )}
      </div>
      
      {acceptedFiles.length > 0 && (
        <div className="mt-4 text-left">
          <p className="text-sm font-medium text-slate-700 mb-2">Selected files:</p>
          <ul className="space-y-1">
            {acceptedFiles.map((file, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                <FileImage className="w-4 h-4" />
                <span>{file.name}</span>
                <span className="text-slate-400">({Math.round(file.size / 1024)} KB)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}