import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Stethoscope, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    const verify = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/verify-email?token=${token}`);
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
      } catch (error: any) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Verification failed. The link may have expired.");
      }
    };

    verify();
  }, [searchParams]);

  const handleGoToLogin = () => {
    window.open("/login", "_blank");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Stethoscope className="w-10 h-10 text-primary" />
            <h1 className="text-3xl font-bold text-gradient">MediScan</h1>
          </div>
        </div>

        {/* Status Card */}
        <div className="glass-morphism p-8 rounded-xl space-y-6 text-center">
          {status === "loading" && (
            <>
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Verifying your email...
              </h2>
              <p className="text-muted-foreground">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Email Verified! ✅
              </h2>
              <p className="text-muted-foreground">{message}</p>
              <Button
                onClick={handleGoToLogin}
                className="w-full bg-primary text-primary-foreground hover:opacity-90 transition-all mt-4"
              >
                Go to Login
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Verification Failed
              </h2>
              <p className="text-muted-foreground">{message}</p>
              <Button
                onClick={handleGoToLogin}
                className="w-full bg-primary text-primary-foreground hover:opacity-90 transition-all mt-4"
              >
                Go to Login
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
