import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Cloud, File, Loader2 } from "lucide-react";
import { toast } from "sonner";
interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}
const FileUpload = ({
  onFileSelect,
  isProcessing
}: FileUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
        onFileSelect(file);
      } else {
        toast.error("Please upload an image file");
      }
    }
  }, [onFileSelect]);
  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".pdf"]
    },
    maxFiles: 1,
    disabled: isProcessing
  });
  return <div className="w-full max-w-3xl mx-auto">
      <div {...getRootProps()} className={`relative border-2 border-dashed rounded-xl p-8 hover:bg-accent/25 transition-colors ${isDragActive ? "border-primary bg-accent/25" : "border-muted-foreground/25"} ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          {preview ? <div className="relative w-full max-w-lg mx-auto">
              <img src={preview} alt="Preview" className="rounded-lg shadow-lg max-h-[300px] w-auto mx-auto object-contain animate-fade-in" />
            </div> : <>
              <div className="p-4 rounded-full bg-background/80 backdrop-blur-sm">
                <Cloud className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-medium text-lg">
                  Drop your medical report here
                </h3>
                <p className="text-muted-foreground text-sm">Supports PNG, JPG, JPEG</p>
              </div>
            </>}
        </div>
      </div>
    </div>;
};
export default FileUpload;