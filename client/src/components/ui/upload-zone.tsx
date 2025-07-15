import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { CloudUpload, FileImage, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileUpload: (files: FileList) => void;
  isUploading?: boolean;
}

export function UploadZone({ onFileUpload, isUploading = false }: UploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setFileName(file.name);

      // Create FileList-like object
      const fileList = {
        0: file,
        length: 1,
        item: (index: number) => index === 0 ? file : null,
        [Symbol.iterator]: function* () {
          yield file;
        }
      } as FileList;

      onFileUpload(fileList);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  const clearPreview = () => {
    setPreview(null);
    setFileName("");
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "upload-zone",
          isDragActive && "border-blue-400 bg-blue-50",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg shadow-sm"
            />
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileImage className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-700 truncate">{fileName}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearPreview();
                }}
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <CloudUpload className="w-12 h-12 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-900">
                {isDragActive ? "Drop receipt here" : "Drop receipt images here"}
              </p>
              <p className="text-sm text-slate-600">or click to browse files</p>
            </div>
            <div className="flex justify-center">
              <Button
                type="button"
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? "Processing..." : "Choose Files"}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Supports JPG, PNG, GIF, WEBP • Max 10MB per file
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
