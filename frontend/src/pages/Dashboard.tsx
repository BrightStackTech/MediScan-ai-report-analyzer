import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  Clock,
  BarChart3,
  Loader2,
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Report {
  _id: string;
  imageUrl: string;
  summary: string;
  createdAt: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalReports, setTotalReports] = useState(0);

  const fetchRecentReports = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/reports/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotalReports(res.data.length);
      setRecentReports(res.data.slice(0, 3));
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRecentReports();
  }, [fetchRecentReports]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-57px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state
  if (totalReports === 0) {
    return (
      <div className="min-h-[calc(100vh-57px)]">
        <div className="container max-w-3xl mx-auto py-16 px-4">
          <div className="glass-morphism rounded-xl p-12 text-center border border-primary/20 bg-primary/5">
            <BarChart3 className="w-14 h-14 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-3">Start Tracking Your Health</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Upload your first medical report to see your health metrics organized by wellness goals.
            </p>
            <Button
              onClick={() => navigate("/upload")}
              className="bg-primary text-primary-foreground hover:opacity-90 gap-2"
            >
              <FileText className="w-4 h-4" />
              Upload Your First Report
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-57px)]">
      <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
        {/* Welcome header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name}</h1>
            <p className="text-muted-foreground mt-1">Here's your health overview</p>
          </div>
          <Button
            onClick={() => navigate("/upload")}
            className="bg-primary text-primary-foreground hover:opacity-90 gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Report
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="glass-morphism p-5 rounded-xl">
            <div className="text-3xl font-bold text-primary">{totalReports}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Reports</div>
          </div>
          <div className="glass-morphism p-5 rounded-xl">
            <div className="text-3xl font-bold text-primary">
              {totalReports > 0
                ? new Date(recentReports[0]?.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })
                : "—"}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Last Upload</div>
          </div>
          <div className="glass-morphism p-5 rounded-xl hidden md:block">
            <div className="text-3xl font-bold text-primary">AI</div>
            <div className="text-sm text-muted-foreground mt-1">Powered Analysis</div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="glass-morphism rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Reports
            </h2>
            {totalReports > 3 && (
              <button
                onClick={() => navigate("/history")}
                className="text-sm text-primary hover:underline"
              >
                View all →
              </button>
            )}
          </div>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report._id}
                className="p-4 rounded-lg bg-background/30 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex gap-4">
                  <img
                    src={report.imageUrl}
                    alt="Report"
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {report.summary}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <div
            onClick={() => navigate("/upload")}
            className="glass-morphism p-6 rounded-xl cursor-pointer hover:bg-white/5 transition-all group"
          >
            <Upload className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold mb-1">Upload New Report</h3>
            <p className="text-sm text-muted-foreground">
              Upload and analyze a new medical report
            </p>
          </div>
          <div
            onClick={() => navigate("/history")}
            className="glass-morphism p-6 rounded-xl cursor-pointer hover:bg-white/5 transition-all group"
          >
            <FileText className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold mb-1">View All Reports</h3>
            <p className="text-sm text-muted-foreground">
              Browse your complete report history
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-6 text-sm text-muted-foreground">
          <p>© 2026 MediScan. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
