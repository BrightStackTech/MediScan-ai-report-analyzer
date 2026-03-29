import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  FileText,
  Clock,
  Volume2,
  StopCircle,
  Search,
  Trash2,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Report {
  _id: string;
  imageUrl: string;
  imageUrls?: string[];
  summary: string;
  createdAt: string;
  reportDate?: string;
  status?: string;
}

const History = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/reports/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
      setFilteredReports(res.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredReports(reports);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredReports(
        reports.filter((r) => r.summary.toLowerCase().includes(q))
      );
    }
  }, [searchQuery, reports]);

  const playAudio = (text: string, id: string) => {
    window.speechSynthesis.cancel();
    setIsPlaying(true);
    setPlayingId(id);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setIsPlaying(false);
      setPlayingId(null);
    };
    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setPlayingId(null);
  };

  const deleteReport = async (reportId: string) => {
    setIsDeleting(true);
    try {
      await axios.delete(`${API_URL}/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(reports.filter((r) => r._id !== reportId));
      toast.success("Report deleted successfully!");
      setShowDeleteDialog(false);
      setDeleteTargetId(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete report");
    } finally {
      setIsDeleting(false);
    }
  };

  const clearAllReports = async () => {
    setIsDeletingAll(true);
    try {
      await axios.delete(`${API_URL}/reports/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports([]);
      setFilteredReports([]);
      toast.success("All reports deleted successfully!");
      setShowClearAllDialog(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to clear reports");
    } finally {
      setIsDeletingAll(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-57px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-57px)]">
      <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Reports</h1>
            <p className="text-muted-foreground mt-1">
              {reports.length} report{reports.length !== 1 ? "s" : ""} analyzed
            </p>
          </div>
          {/* Search & Clear All */}
          {reports.length > 0 && (
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-white/10 focus:border-primary"
                />
              </div>
              <Button
                onClick={() => setShowClearAllDialog(true)}
                variant="outline"
                size="sm"
                className="border-red-400/30 text-red-400 hover:bg-red-400/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Empty state */}
        {reports.length === 0 && (
          <div className="glass-morphism rounded-xl p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No reports yet. Upload your first medical report to get started!
            </p>
          </div>
        )}

        {/* No search results */}
        {reports.length > 0 && filteredReports.length === 0 && (
          <div className="glass-morphism rounded-xl p-8 text-center">
            <Search className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No reports match your search.</p>
          </div>
        )}

        {/* Report list */}
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const isExpanded = expandedId === report._id;
            return (
              <div
                key={report._id}
                className="glass-morphism rounded-xl overflow-hidden"
              >
                <div
                  className="p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : report._id)
                  }
                >
                  <div className="flex gap-4">
                    <img
                      src={report.imageUrl}
                      alt="Report"
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(report.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <p
                        className={`text-sm text-muted-foreground leading-relaxed ${
                          isExpanded ? "" : "line-clamp-2"
                        }`}
                      >
                        {report.summary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expanded actions */}
                {isExpanded && (
                  <div className="px-5 pb-4 flex gap-3 border-t border-white/5 pt-3">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudio(report.summary, report._id);
                      }}
                      disabled={isPlaying && playingId === report._id}
                      variant="outline"
                      size="sm"
                      className="border-white/10 hover:bg-white/5"
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      {isPlaying && playingId === report._id
                        ? "Playing..."
                        : "Listen"}
                    </Button>
                    {isPlaying && playingId === report._id && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          stopAudio();
                        }}
                        variant="outline"
                        size="sm"
                        className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                      >
                        <StopCircle className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                    )}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        const images = report.imageUrls || [report.imageUrl];
                        navigate("/results", {
                          state: {
                            summary: report.summary,
                            images: images.filter((img) => img),
                            primaryImage: report.imageUrl,
                            reportDate: report.reportDate || null,
                            uploadDate: report.createdAt,
                            status: report.status || "completed",
                            biomarkerCount: 14,
                            reportId: report._id,
                          }
                        });
                      }}
                      variant="outline"
                      size="sm"
                      className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Detailed
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTargetId(report._id);
                        setShowDeleteDialog(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Clear All Dialog */}
        <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Reports?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all {reports.length} report{reports.length !== 1 ? "s" : ""} from your history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={clearAllReports}
                disabled={isDeletingAll}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isDeletingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete All"
                )}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Single Report Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Report?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this report from your history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteTargetId && deleteReport(deleteTargetId)}
                disabled={isDeleting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default History;
