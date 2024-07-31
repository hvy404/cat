"use client";

import { useState } from "react";
import { useAuth, useSignUp, SignInButton } from "@clerk/nextjs";
import { createId } from "@paralleldrive/cuid2";
import AddResume from "../candidate/add-resume";
import MainLanding from "../candidate/hero";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Import the server action
import { updatePublicMetadata } from "./actions";

const CustomSignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const { isLoaded, signUp, setActive } = useSignUp();

  if (!isLoaded) {
    return null;
  }

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setShowVerification(true);
      toast.success("Please check your email for the verification code.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "An error occurred during sign up."
      );
    }
  };

  const handleVerification = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });
      if (completeSignUp.status !== "complete") {
        console.log(JSON.stringify(completeSignUp, null, 2));
      } else {
        if (completeSignUp.createdSessionId) {
          await setActive({ session: completeSignUp.createdSessionId });

          // Update public metadata using the server action
          const cuid = createId();
          if (completeSignUp.createdUserId) {
            await updatePublicMetadata(completeSignUp.createdUserId, {
              role: "talent",
              cuid,
            });
          }
        }
        toast.success("Email verified successfully!");

        // Router push to /dashboard
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error verifying email");
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{showVerification ? "Verify Email" : "Sign Up"}</CardTitle>
        <CardDescription>
          {showVerification
            ? "Enter the verification code sent to your email"
            : "Create a new account"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={showVerification ? handleVerification : handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            {!showVerification ? (
              <>
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
              </>
            ) : (
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
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            {showVerification ? "Verify Email" : "Sign Up"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

const Main = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <AddResume />
      </div>
      <div className="flex justify-center space-x-4 mt-8">
        {!isSignedIn && (
          <>
            <SignInButton mode="modal" forceRedirectUrl={"/dashboard"}>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
            <CustomSignUpForm />
          </>
        )}
      </div>
    </div>
  );
};

export default Main;
