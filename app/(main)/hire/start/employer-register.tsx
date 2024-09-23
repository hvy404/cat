import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createId } from "@paralleldrive/cuid2";
import { updatePublicMetadata } from "@/lib/auth/actions";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEnhancedDetection } from "@/app/candidate/components/enhance-det";
import { load } from "@fingerprintjs/botd";
import { checkApprovedEmail } from "@/app/(main)/hire/start/permission";
import SlidingBulletMessage from "@/app/(main)/hire/start/sliding-message";

const EmployerSignUpBox: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const { isLoaded, signUp, setActive } = useSignUp();
  const [employerId, setEmployerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isLikelyBot } = useEnhancedDetection();
  const formRef = useRef<HTMLFormElement>(null);
  const [isBotd, setIsBotd] = useState(false);

  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    const newCuid = createId();
    setEmployerId(newCuid);
  }, []);

  useEffect(() => {
    const runBotd = async () => {
      const botd = await load({
        monitoring: false,
      });
      const result = await botd.detect();
      setIsBotd(result.bot);
    };
    runBotd();
  }, []);

  useEffect(() => {
    const currentForm = formRef.current;
    if (currentForm) {
      const handleMouseMove = () => {};
      const handleKeyDown = () => {};
  
      currentForm.addEventListener("mousemove", handleMouseMove);
      currentForm.addEventListener("keydown", handleKeyDown);
  
      return () => {
        currentForm.removeEventListener("mousemove", handleMouseMove);
        currentForm.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, []);
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    if (isLikelyBot || isBotd) {
      setErrorMessage(
        "Our system detected unusual behavior. Please try again."
      );
      setShowErrorMessage(true);
      return;
    }

    try {
      setIsLoading(true);

      // Check if the email is approved
      const { allow } = await checkApprovedEmail(email);
      if (!allow) {
        setErrorMessage("This email is not approved for registration.");
        setShowErrorMessage(true);
        setIsLoading(false);
        return;
      }

      // Continue with the existing sign-up process
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setShowVerification(true);
      setErrorMessage("Please check your email for the verification code.");
      setShowErrorMessage(true);
    } catch (err: any) {
      console.error("Sign-up error:", err);
      if (err && err.errors) {
        const errorMsg =
          err.errors[0]?.longMessage ||
          err.errors[0]?.message ||
          "An error occurred during sign-up.";
        setErrorMessage(errorMsg);
      } else {
        setErrorMessage("An unexpected error occurred during sign-up.");
      }
      setShowErrorMessage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signUp) {
      return;
    }

    try {
      setIsLoading(true);
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });
      if (completeSignUp.status !== "complete") {
        throw new Error("Verification failed");
      } else {
        if (completeSignUp.createdSessionId) {
          await setActive({ session: completeSignUp.createdSessionId });

          if (completeSignUp.createdUserId) {
            await updatePublicMetadata(completeSignUp.createdUserId, {
              aiq_role: "employer-trial",
              aiq_cuid: employerId,
            });
          }

          toast.success("Email verified successfully!");
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setIsLoading(false);
      console.error("Verification error:", err);
      toast.error(err instanceof Error ? err.message : "Error verifying email");
    }
  };
  return (
    <div className="relative w-full max-w-md mx-auto">
      <motion.div
        className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden z-10 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SlidingBulletMessage
          message={errorMessage}
          isVisible={showErrorMessage}
          onDismiss={() => setShowErrorMessage(false)}
        />
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            {!showVerification ? "Start Hiring" : "Verify Email"}
          </h2>
          <form
            ref={formRef}
            onSubmit={!showVerification ? handleSubmit : handleVerification}
          >
            <div className="space-y-6">
              {!showVerification ? (
                <>
                  <div>
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <Label
                    htmlFor="verificationCode"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Verification Code
                  </Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="Enter code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                disabled={isLoading || isLikelyBot}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : !showVerification ? (
                  "Sign Up"
                ) : (
                  "Verify Email"
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EmployerSignUpBox;
