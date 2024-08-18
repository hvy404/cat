import React, { useState, useEffect } from "react";
import { useSignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { createId } from "@paralleldrive/cuid2";
import { setEmployerMetadata } from "@/lib/auth/set-metadata";
import { triggerEmployerSignup } from "@/lib/auth/trigger-signup";

const EmployerSignUpBox: React.FC = () => {
  const [showSignUp, setShowSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const { isLoaded, signUp, setActive } = useSignUp();
  const [employerId, setEmployerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const newCuid = createId();
    setEmployerId(newCuid);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setShowVerification(true);
      toast.success("Please check your email for the verification code.");
    } catch (err: any) {
      if (err && err.errors) {
        const errorMessage =
          err.errors[0]?.longMessage ||
          err.errors[0]?.message ||
          "An error occurred during sign-up.";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred during sign-up.");
      }
      console.error("Sign-up error:", err);
    }
  };

  const handleVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signUp) return;

    try {
      setIsLoading(true);
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status !== "complete") {
        throw new Error("Verification failed");
      }

      if (completeSignUp.createdSessionId) {
        await setActive({ session: completeSignUp.createdSessionId });

        if (completeSignUp.createdUserId) {
          const result = await setEmployerMetadata(
            completeSignUp.createdUserId,
            employerId
          );
          const resultSignup = await triggerEmployerSignup(employerId, email);
          if (!resultSignup.success) {
            throw new Error(resultSignup.error || "Failed to onboard employer");
          }

          if (!result.success) {
            throw new Error(
              result.error || "Failed to update employer metadata"
            );
          }
        }

        toast.success("Email verified successfully!");
        // Redirect or perform any other action after successful sign-up
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error verifying email");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-md">
      {showSignUp && !showVerification && (
        <Card>
          <CardHeader>
            <CardTitle>Employer Sign Up</CardTitle>
            <CardDescription>
              Create an employer account to get started
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
      {showVerification && (
        <Card>
          <CardHeader>
            <CardTitle>Verify Email</CardTitle>
            <CardDescription>
              Enter the verification code sent to your email
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleVerification}>
            <CardContent>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Verify Email
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
};

export default EmployerSignUpBox;