"use client";
import React, { useState, useEffect } from "react";
import { useSignIn, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Linkedin,
  Mail,
  KeyIcon,
  LogOut,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { load } from "@fingerprintjs/botd";
import { useEnhancedDetection } from "@/app/candidate/components/enhance-det";

const SignInPage = () => {
  const [isDetecting, setIsDetecting] = useState(true);
  const [isBotDetected, setIsBotDetected] = useState(false);
  const { isLikelyBot } = useEnhancedDetection();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mode, setMode] = useState<"signIn" | "requestReset" | "enterCode">(
    "signIn"
  );
  const [existingSession, setExistingSession] = useState(false);
  const { signIn, isLoaded } = useSignIn();
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    const runBotDetection = async () => {
      setIsDetecting(true);
      try {
        const botd = await load();
        const result = await botd.detect();
        setIsBotDetected(result.bot);
      } catch (error) {
        console.error("Bot detection error:", error);
      } finally {
        setTimeout(() => {
          setIsDetecting(false);
        }, 2000);
      }
    };

    runBotDetection();
  }, []);

  const handleEmailPasswordSignIn = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        router.push("/dashboard");
      } else {
        setError(`Unexpected status: ${result.status}`);
      }
    } catch (err: any) {
      console.error("Sign-in error:", err);
      if (err.errors?.[0]?.code === "session_exists") {
        setExistingSession(true);
        setError(
          "You're currently signed in to another account. Please sign out first."
        );
      } else {
        setError(
          "An error occurred during sign-in. Please check your credentials and try again."
        );
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setExistingSession(false);
    setError("");
  };

  const handleLinkedInSignIn = async () => {
    if (!isLoaded) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_linkedin",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      console.error("Error during LinkedIn sign-in:", err);
      setError("An error occurred with LinkedIn sign-in. Please try again.");
    }
  };

  const handleRequestPasswordReset = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setSuccessMessage(
        "Password reset email sent. Please check your inbox for the code."
      );
      setMode("enterCode");
    } catch (err) {
      console.error("Password reset request error:", err);
      setError(
        "An error occurred while requesting a password reset. Please try again."
      );
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode,
        password: newPassword,
      });

      if (result.status === "complete") {
        setSuccessMessage(
          "Password reset successful. Redirecting to dashboard..."
        );
        router.push("/dashboard");
      } else {
        setError("Password reset failed. Please try again.");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError(
        "An error occurred while resetting your password. Please try again."
      );
    }
  };

  if (isDetecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center items-center">
        <Card className="w-full max-w-md p-6 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-indigo-600 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">Detecting...</h2>
          <p className="text-gray-600">
            Please wait while we ensure a secure environment.
          </p>
        </Card>
      </div>
    );
  }

  if (isBotDetected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center items-center">
        <Card className="w-full max-w-md p-6 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">
            We've detected unusual activity. Please try again later or contact
            support.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Abstract Shape Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute w-full h-full"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path
            d="M0,1000 C200,800 350,900 500,750 C650,600 700,750 800,600 C900,450 1000,500 1000,500 V1000 H0"
            fill="url(#grad)"
          >
            <animate
              attributeName="d"
              dur="20s"
              repeatCount="indefinite"
              values="
            M0,1000 C200,800 350,900 500,750 C650,600 700,750 800,600 C900,450 1000,500 1000,500 V1000 H0;
            M0,1000 C150,850 300,950 450,800 C600,650 750,700 850,550 C950,400 1000,450 1000,450 V1000 H0;
            M0,1000 C200,800 350,900 500,750 C650,600 700,750 800,600 C900,450 1000,500 1000,500 V1000 H0"
            />
          </path>
        </svg>
      </div>

      {/* Sign-in Card */}
      <Card className="w-full max-w-md border-none shadow-lg overflow-hidden relative z-10">
        <div className="px-6 pt-8 pb-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-lg">
          <h2 className="text-3xl font-extrabold text-white text-center">
            {mode === "signIn"
              ? "Welcome Back"
              : mode === "requestReset"
              ? "Reset Password"
              : "Enter Reset Code"}
          </h2>
        </div>
        <div className="p-6 bg-white rounded-b-lg">
          {mode === "signIn" && (
            <>
              <form onSubmit={handleEmailPasswordSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {successMessage && (
                  <p className="text-green-500 text-sm">{successMessage}</p>
                )}
                {existingSession ? (
                  <Button
                    onClick={handleSignOut}
                    className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out of Existing Session
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLikelyBot}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Sign In with Email
                  </Button>
                )}
              </form>
              <Button
                type="button"
                variant="link"
                onClick={() => setMode("requestReset")}
                className="w-full mt-2 text-indigo-600 hover:text-indigo-500"
              >
                Forgot Password?
              </Button>
              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>
                <Button
                  onClick={handleLinkedInSignIn}
                  variant="outline"
                  className="w-full mt-4 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                >
                  <Linkedin className="w-4 h-4 mr-2 text-blue-600" />
                  Sign In with LinkedIn
                </Button>
              </div>
            </>
          )}
          {mode === "requestReset" && (
            <form onSubmit={handleRequestPasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="reset-email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {successMessage && (
                <p className="text-green-500 text-sm">{successMessage}</p>
              )}
              <Button
                type="submit"
                disabled={isLikelyBot}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
              >
                <KeyIcon className="w-4 h-4 mr-2" />
                Send Reset Email
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={() => setMode("signIn")}
                className="w-full mt-2 text-indigo-600 hover:text-indigo-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </form>
          )}
          {mode === "enterCode" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="reset-code"
                  className="text-sm font-medium text-gray-700"
                >
                  Reset Code
                </Label>
                <Input
                  id="reset-code"
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="new-password"
                  className="text-sm font-medium text-gray-700"
                >
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {successMessage && (
                <p className="text-green-500 text-sm">{successMessage}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
              >
                <KeyIcon className="w-4 h-4 mr-2" />
                Reset Password
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={() => setMode("signIn")}
                className="w-full mt-2 text-indigo-600 hover:text-indigo-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SignInPage;
