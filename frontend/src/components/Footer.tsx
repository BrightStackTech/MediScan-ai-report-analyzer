import { useLocation } from "react-router-dom";
import { Stethoscope, Github, Linkedin, Mail, Heart } from "lucide-react";

const Footer = () => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  // Hide footer on certain pages if needed
  const hideFooterPaths = [];
  if (hideFooterPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <footer className="border-t border-white/10 bg-background/50 backdrop-blur-lg mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold text-gradient">MediScan</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Advanced AI-powered medical diagnosis system for accurate and instant health analysis.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/upload"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Upload Report
                </a>
              </li>
              <li>
                <a
                  href="/history"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  My Reports
                </a>
              </li>
              <li>
                <a
                  href="/profile"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Profile
                </a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Connect</h3>
            <div className="flex gap-4">
              <a
                href="#"
                aria-label="GitHub"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@mediscan.com"
                aria-label="Email"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} MediScan. All rights reserved. Made with{" "}
              <Heart className="inline w-4 h-4 text-red-500" /> for better healthcare.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
