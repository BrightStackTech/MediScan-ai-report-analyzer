import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Stethoscope,
  LayoutDashboard,
  FileText,
  Upload,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navLinks = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "My Reports", path: "/history", icon: FileText },
  { label: "Upload Report", path: "/upload", icon: Upload },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setSidebarOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  if (!user) return null;

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex items-center justify-between px-6 py-3 border-b border-white/10 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <Stethoscope className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold text-gradient">MediScan</span>
          </div>
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavigate(link.path)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: User + Sign Out */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <img
              src={user.profilePicture}
              alt="PFP"
              className="w-7 h-7 rounded-full object-cover border border-white/20"
            />
            <span>{user.email}</span>
          </button>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
          >
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <Stethoscope className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold text-gradient">MediScan</span>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-muted-foreground hover:text-foreground"
        >
          <Menu className="w-6 h-6" />
        </button>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-72 bg-background border-l border-white/10 z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold text-gradient">MediScan</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img
                src={user.profilePicture}
                alt="PFP"
                className="w-10 h-10 rounded-full object-cover border border-white/20"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex-1 p-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.label}
                  onClick={() => handleNavigate(link.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </button>
              );
            })}
            <button
              onClick={() => handleNavigate("/profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === "/profile"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <User className="w-5 h-5" />
              Profile
            </button>
          </div>

          {/* Sign Out */}
          <div className="p-4 border-t border-white/10">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full gap-2 border-red-400/30 text-red-400 hover:bg-red-400/10"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
