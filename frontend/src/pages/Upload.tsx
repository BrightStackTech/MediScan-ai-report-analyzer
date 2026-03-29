import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Upload as UploadIcon,
  FileText,
  ImageIcon,
  ShieldCheck,
  CheckCircle,
  X,
  Volume2,
  StopCircle,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const UploadPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      addFiles(files);
      setCurrentSummary(null);
    }
  };

  const addFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast.error("Please select valid image files");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...imageFiles]);

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      addFiles(files);
      setCurrentSummary(null);
    }
  };

  const clearFile = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setCurrentSummary(null);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const analyzeReport = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append(`reportImage`, file);
      });

      const res = await axios.post(`${API_URL}/reports/analyze`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setCurrentSummary(res.data.summary);
      toast.success("Report analyzed successfully!");

      // Navigate to results page with summary and all images
      setTimeout(() => {
        navigate("/results", {
          state: {
            summary: res.data.summary,
            images: previews,
            primaryImage: previews[0],
            reportDate: res.data.reportDate || null,
            uploadDate: new Date().toISOString(),
            status: "completed",
            biomarkerCount: res.data.biomarkerCount || 14,
            reportId: res.data.reportId || "",
          }
        });
      }, 500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to analyze report");
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = (text: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="min-h-[calc(100vh-57px)]">
      <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Upload Medical Report</h1>
          <p className="text-muted-foreground mt-1">
            Upload your medical test report to extract and track your biomarker data
          </p>
        </div>

        {/* Step 1: Upload */}
        <div className="glass-morphism rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Step 1: Upload Your Reports</h2>

          {selectedFiles.length > 0 ? (
            <div className="space-y-4">
              {/* Files preview grid */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="border border-primary/30 bg-primary/5 rounded-lg overflow-hidden">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <p className="text-xs text-muted-foreground mt-2 truncate">
                        {selectedFiles[index]?.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => document.getElementById("reportInput")?.click()}
                  variant="outline"
                  className="border-white/10 hover:bg-white/5"
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Add More
                </Button>
                <Button
                  onClick={clearFile}
                  variant="outline"
                  className="border-white/10 hover:bg-white/5"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>

              {/* Process Button */}
              {!isProcessing && !currentSummary && (
                <Button
                  onClick={analyzeReport}
                  className="w-full bg-primary text-primary-foreground hover:opacity-90 py-6 text-base"
                >
                  Process Reports
                </Button>
              )}

              {/* Processing state */}
              {isProcessing && (
                <div className="text-center py-6">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
                  <p className="font-medium">Extracting biomarkers...</p>
                  <p className="text-sm text-muted-foreground">
                    This may take a few moments while we analyze {selectedFiles.length} report{selectedFiles.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Drop zone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("reportInput")?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <UploadIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground font-medium mb-1">
                Drop your medical reports here
              </p>
              <p className="text-sm text-muted-foreground mb-3">or click to browse</p>
              <p className="text-xs text-primary">Supported formats: JPG, PNG, WebP</p>
              <p className="text-xs text-muted-foreground">You can upload 1 or more images</p>
              <input
                id="reportInput"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Analysis Result */}
        {currentSummary && (
          <div className="glass-morphism rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Analysis Result
            </h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {currentSummary}
            </p>
            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => playAudio(currentSummary)}
                disabled={isPlaying}
                variant="outline"
                size="sm"
                className="border-white/10 hover:bg-white/5"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                {isPlaying ? "Playing..." : "Listen"}
              </Button>
              {isPlaying && (
                <Button
                  onClick={stopAudio}
                  variant="outline"
                  size="sm"
                  className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                >
                  <StopCircle className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              )}
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="glass-morphism rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-5">How It Works</h2>
          <div className="space-y-5">
            {[
              {
                step: 1,
                title: "Upload Your Report",
                desc: "Select a medical report in JPG, PNG, or WebP format",
              },
              {
                step: 2,
                title: "AI Extraction",
                desc: "Our AI will automatically extract biomarker data from your report",
              },
              {
                step: 3,
                title: "Verify & Save",
                desc: "Review the extracted data, make any corrections, and save to your health record",
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">{item.step}</span>
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="glass-morphism rounded-xl p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Your Privacy is Protected</h3>
              <p className="text-sm text-muted-foreground">
                Your report is processed securely and immediately deleted after extraction.
                We only store the anonymized biomarker values — no personal information is ever saved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
