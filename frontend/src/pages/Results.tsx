import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Volume2,
  StopCircle,
  ArrowLeft,
  Heart,
  Activity,
  Droplets,
  Wind,
  X,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get data from navigation state
  const summary = (location.state as any)?.summary || "";
  const images = (location.state as any)?.images || [];
  const primaryImage = (location.state as any)?.primaryImage || images[0] || "";
  const reportDate = (location.state as any)?.reportDate || "";
  const uploadDate = (location.state as any)?.uploadDate || "";
  const status = (location.state as any)?.status || "completed";
  const biomarkerCount = (location.state as any)?.biomarkerCount || 14;
  const reportId = (location.state as any)?.reportId || "";

  const playAudio = () => {
    if (!summary) {
      toast.error("No summary to play");
      return;
    }
    if (isPlaying) return;
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const deleteReport = async () => {
    if (!reportId || !reportId.trim()) {
      toast.error("Report ID not available. Please access from History to delete.");
      return;
    }

    if (!token) {
      toast.error("Authentication token not found");
      return;
    }

    setIsDeleting(true);
    try {
      const url = `${API_URL}/reports/${reportId}`;
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Report deleted successfully!");
      setTimeout(() => navigate("/history"), 500);
    } catch (error: any) {
      console.error("Delete error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to delete report";
      toast.error(errorMsg);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Sample biomarker data with medical icons/emojis
  const biomarkers = [
    {
      category: "❤️ Cardiac Markers",
      icon: Heart,
      data: [
        { name: "Troponin I", value: "0.04", unit: "ng/mL", normal: "< 0.04" },
        { name: "CK-MB", value: "2.5", unit: "ng/mL", normal: "< 5" },
        { name: "BNP", value: "45", unit: "pg/mL", normal: "< 100" },
      ],
    },
    {
      category: "📊 Blood Count",
      icon: Activity,
      data: [
        { name: "WBC", value: "7.2", unit: "K/µL", normal: "4.5-11" },
        { name: "RBC", value: "4.8", unit: "M/µL", normal: "4.5-5.9" },
        { name: "Hemoglobin", value: "14.5", unit: "g/dL", normal: "13.5-17.5" },
      ],
    },
    {
      category: "💧 Kidney Function",
      icon: Droplets,
      data: [
        { name: "Creatinine", value: "0.95", unit: "mg/dL", normal: "0.74-1.35" },
        { name: "BUN", value: "18", unit: "mg/dL", normal: "7-25" },
        { name: "GFR", value: "89", unit: "mL/min", normal: "> 60" },
      ],
    },
    {
      category: "🫁 Respiratory Markers",
      icon: Wind,
      data: [
        { name: "O₂ Saturation", value: "98", unit: "%", normal: "> 95" },
        { name: "pCO₂", value: "40", unit: "mmHg", normal: "35-45" },
        { name: "pO₂", value: "95", unit: "mmHg", normal: "80-100" },
      ],
    },
  ];

  return (
    <div className="min-h-[calc(100vh-57px)]">
      <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analysis Results</h1>
            <p className="text-muted-foreground mt-1">
              Your medical report has been analyzed
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/upload")}
            className="border-white/10 hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Upload Another
          </Button>
        </div>

        {/* Report Images */}
        {(primaryImage || images.length > 0) && (
          <div className="space-y-4">
            {/* Main Image */}
            <div
              onClick={() => setShowImageModal(true)}
              className="glass-morphism rounded-xl p-6 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <p className="text-sm font-medium text-muted-foreground mb-4">
                Medical Report Image {images.length > 1 && `(1 of ${images.length})`}
              </p>
              <img
                src={primaryImage}
                alt="Medical Report"
                className="w-full max-h-96 object-cover rounded-lg"
              />
              <p className="text-xs text-muted-foreground mt-3">Click to view full image</p>
            </div>

            {/* Thumbnail Gallery (if multiple images) */}
            {images.length > 1 && (
              <div className="glass-morphism rounded-xl p-4">
                <p className="text-sm font-medium text-muted-foreground mb-3">All Images</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {images.map((img: string, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setCurrentImageIndex(idx);
                        setShowImageModal(true);
                      }}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 hover:opacity-80 transition-opacity ${
                        idx === 0 ? "border-primary" : "border-white/10"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Report ${idx + 1}`}
                        className="w-full h-20 object-cover"
                      />
                      <span className="absolute bottom-1 right-1 text-xs bg-black/50 text-white px-2 py-0.5 rounded">
                        {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image Modal */}
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="max-w-5xl w-full max-h-screen overflow-auto">
            <DialogClose className="absolute right-4 top-4 z-10">
              <X className="h-4 w-4" />
            </DialogClose>
            <div className="relative">
              {images[currentImageIndex] && (
                <img
                  src={images[currentImageIndex]}
                  alt={`Report ${currentImageIndex + 1}`}
                  className="w-full"
                />
              )}

              {/* Navigation for multiple images */}
              {images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1
                      );
                    }}
                    className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <span className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                    {currentImageIndex + 1} of {images.length}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Report Information Block */}
        <div className="glass-morphism rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-6">Report Information</h2>
              <div className="grid grid-cols-2 gap-6">
                {/* Report Date */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Report Date</p>
                  <p className="text-foreground font-medium">
                    {reportDate ? formatDate(reportDate) : "N/A"}
                  </p>
                </div>

                {/* Upload Date */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Upload Date</p>
                  <p className="text-foreground font-medium">
                    {uploadDate ? formatDate(uploadDate) : "N/A"}
                  </p>
                </div>

                {/* Biomarkers */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Biomarkers</p>
                  <p className="text-foreground font-medium">{biomarkerCount}</p>
                </div>

                {/* Status */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                    {status === "completed" ? "✓" : ""} {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-col sm:flex-row">
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="outline"
                className="border-red-400/30 text-red-400 hover:bg-red-400/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Report
              </Button>
            </div>
          </div>
        </div>

        {/* Delete Report Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Report?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this report and all its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteReport}
                disabled={isDeleting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Summary Section */}
        {summary && (
          <div className="glass-morphism rounded-xl p-6">
            <div className="space-y-4">
              <p className="text-foreground leading-relaxed">
                {summary}
              </p>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={playAudio}
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
          </div>
        )}

        {/* Biomarker Tables */}
        <div className="space-y-6">
          {biomarkers.map((section, idx) => (
            <div key={idx} className="glass-morphism rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-5">{section.category}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Biomarker
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        Value
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        Unit
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        Normal Range
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.data.map((item, itemIdx) => (
                      <tr
                        key={itemIdx}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="text-right py-3 px-4 font-medium">
                          {item.value}
                        </td>
                        <td className="text-right py-3 px-4 text-muted-foreground">
                          {item.unit}
                        </td>
                        <td className="text-right py-3 px-4 text-muted-foreground">
                          {item.normal}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                            ✓ Normal
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Medical Icons/Emojis Legend */}
        <div className="glass-morphism rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Analysis Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">❤️</span>
              <span className="text-sm text-muted-foreground">Cardiac Health</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <span className="text-sm text-muted-foreground">Blood Analysis</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">💧</span>
              <span className="text-sm text-muted-foreground">Kidney Function</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🫁</span>
              <span className="text-sm text-muted-foreground">Respiratory</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => navigate("/history")}
            variant="outline"
            className="border-white/10 hover:bg-white/5"
          >
            View History
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-primary text-primary-foreground hover:opacity-90"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
