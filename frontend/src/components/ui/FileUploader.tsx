import React, { useRef, useState } from 'react';
import { UploadCloud, File, X, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FileUploaderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  onFileSelect?: (file: File | null) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  error,
  helperText,
  className,
  onChange,
  onFileSelect,
  disabled,
  ...props
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
    if (onChange) onChange(e);
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
      const nativeEvent = new Event('change', { bubbles: true });
      inputRef.current.dispatchEvent(nativeEvent);
      if (onChange) {
        onChange({
          target: inputRef.current,
          currentTarget: inputRef.current,
        } as React.ChangeEvent<HTMLInputElement>);
      }
    }
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label className={cn("text-sm font-medium leading-none", error ? "text-red-600" : "text-slate-700")}>
          {label}
        </label>
      )}
      
      {!selectedFile ? (
        <div
          className={cn(
            "relative flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed transition-all duration-200",
            dragActive 
              ? "border-primary-500 bg-primary-50" 
              : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400",
             error && "border-red-500 bg-red-50",
             disabled && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleChange}
            disabled={disabled}
            {...props}
          />
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center pointer-events-none">
            <UploadCloud className={cn("w-8 h-8 mb-2", error ? "text-red-500" : "text-slate-400")} />
            <p className={cn("mb-1 text-sm", error ? "text-red-600" : "text-slate-600")}>
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500">
               Any file type (max 10MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md shadow-sm group">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-primary-50 rounded-full">
                    <File className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-slate-700 truncate">{selectedFile.name}</span>
                    <span className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
            </div>
            <button
                type="button"
                onClick={clearFile}
                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
      )}

      {(helperText || error) && (
        <p className={cn("text-[0.8rem]", error ? "text-red-600 font-medium" : "text-slate-500")}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};