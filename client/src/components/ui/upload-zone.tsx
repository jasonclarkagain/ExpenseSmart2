import { useDropzone } from 'react-dropzone';
import { Upload, Image, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onFileUpload: (files: FileList) => void;
  isUploading?: boolean;
  className?: string;
}

export function UploadZone({ onFileUpload, isUploading = false, className }: UploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const fileList = new DataTransfer();
        acceptedFiles.forEach(file => fileList.items.add(file));
        onFileUpload(fileList.files);
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive 
            ? "border-blue-400 bg-blue-50 dark:bg-blue-950/50" 
            : "border-slate-300 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {isUploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          ) : (
            <div className={cn(
              "rounded-full p-3",
              isDragActive ? "bg-blue-100 dark:bg-blue-900" : "bg-slate-100 dark:bg-slate-800"
            )}>
              {isDragActive ? (
                <Upload className="h-6 w-6 text-blue-600" />
              ) : (
                <Image className="h-6 w-6 text-slate-600" />
              )}
            </div>
          )}
          
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {isUploading 
                ? "Processing receipt..." 
                : isDragActive 
                  ? "Drop the receipt here"
                  : "Upload receipt image"
              }
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isUploading 
                ? "AI is analyzing your receipt" 
                : "PNG, JPG, GIF up to 10MB"
              }
            </p>
          </div>
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>
            {fileRejections[0].errors[0].message}
          </span>
        </div>
      )}
    </div>
  );
}