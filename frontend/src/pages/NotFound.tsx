import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="glass-morphism p-12 rounded-xl text-center space-y-8">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="p-6 bg-red-500/10 rounded-full">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
          </div>

          {/* Error Content */}
          <div className="space-y-4">
            <div>
              <h1 className="text-7xl font-bold text-gradient mb-2">404</h1>
              <p className="text-sm text-primary font-semibold tracking-widest uppercase">Page Not Found</p>
            </div>

            <div className="space-y-3 mt-6">
              <h2 className="text-3xl font-bold text-foreground">
                Oops! We couldn't find that page
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                The page you're looking for doesn't exist or has been moved. Don't worry, you can always return to our home page or explore our features.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={() => navigate("/")}
              size="lg"
              className="group bg-primary text-primary-foreground hover:opacity-90 transition-all"
            >
              <Home className="mr-2 w-4 h-4" />
              Return to Home
            </Button>
            <Button
              onClick={() => navigate(-1)}
              size="lg"
              variant="outline"
              className="group hover:bg-primary/5"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Go Back
            </Button>
          </div>

          {/* Decorative Elements */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-sm text-muted-foreground">
              Need help? Check out our <span className="text-primary font-semibold">documentation</span> or contact <span className="text-primary font-semibold">support</span>
            </p>
          </div>
        </div>

        {/* Background Blur Elements */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20" />
      </div>
    </div>
  );
};

export default NotFound;
