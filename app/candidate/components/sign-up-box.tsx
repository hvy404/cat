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

const SignUpBox: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const { isLoaded, signUp, setActive } = useSignUp();
  const [candidateId, setCandidateId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isLikelyBot } = useEnhancedDetection();
  const formRef = useRef<HTMLFormElement>(null);
  const [isBotd, setIsBotd] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const newCuid = createId();
    setCandidateId(newCuid);
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
      toast.error("Our system detected unusual behavior. Please try again.");
      return;
    }

    try {
      setIsLoading(true);
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setShowVerification(true);
      toast.success("Please check your email for the verification code.");
    } catch (err: any) {
      console.error("Sign-up error:", err);
      if (err && err.errors) {
        const errorMessage =
          err.errors[0]?.longMessage ||
          err.errors[0]?.message ||
          "An error occurred during sign-up.";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred during sign-up.");
      }
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
              aiq_role: "talent",
              aiq_cuid: candidateId,
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden"
    >
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          {!showVerification ? "Create Account" : "Verify Email"}
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
  );
};
export default SignUpBox;
