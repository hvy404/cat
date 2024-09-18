import React, { useEffect, useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import useStore from "@/app/state/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { z } from "zod";

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/^\S*$/, "Password cannot contain spaces");

const formSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AccountManage() {
  const { isExpanded, setExpanded } = useStore();
  const { user } = useUser();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      setExpanded(false);
    };
  }, [setExpanded]);

  useEffect(() => {
    // Update password strength
    setPasswordStrength(newPassword.length >= 8 ? 100 : (newPassword.length / 8) * 100);
  }, [newPassword]);

  const isFormValid = useMemo(() => {
    try {
      formSchema.parse({ currentPassword, newPassword, confirmPassword });
      return true;
    } catch (error) {
      return false;
    }
  }, [currentPassword, newPassword, confirmPassword]);

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSubmitting(true);

    try {
      formSchema.parse({ currentPassword, newPassword, confirmPassword });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        setIsSubmitting(false);
        return;
      }
    }

    if (!user) {
      setError("User not found");
      setIsSubmitting(false);
      return;
    }

    try {
      await user.updatePassword({
        currentPassword,
        newPassword,
      });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStrength(0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while changing the password"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setError("");
  };

  return (
    <main className="flex flex-1 gap-4 p-4">
      <div
        className={`flex flex-col gap-4 transition-all duration-700 ease-in-out w-full md:w-full max-h-[90vh] overflow-y-auto ${
          isExpanded ? "lg:w-3/4" : "lg:w-3/5"
        }`}
      >
        <div className="flex justify-between gap-6 rounded-lg border p-4">
          <h2 className="font-bold leading-6 text-gray-900">
            Account Settings
          </h2>
        </div>
        <div className="flex flex-col gap-6">
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <h3 className="text-lg font-semibold">Change Password</h3>
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current Password</label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCurrentPassword(e.target.value);
                  resetForm();
                }}
                placeholder="Current Password"
                required
                disabled={success}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setNewPassword(e.target.value);
                  resetForm();
                }}
                placeholder="New Password"
                required
                disabled={success}
              />
              <div className="space-y-1">
                <Progress value={passwordStrength} className="w-full h-2" />
                <p className="text-xs text-gray-500">
                  {newPassword.length < 8
                    ? `${8 - newPassword.length} more characters needed`
                    : "Password meets minimum length"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm New Password</label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setConfirmPassword(e.target.value);
                  resetForm();
                }}
                placeholder="Confirm New Password"
                required
                disabled={success}
              />
            </div>
            <Button type="submit" disabled={isSubmitting || success || !isFormValid}>
              {isSubmitting ? "Changing Password..." : "Change Password"}
            </Button>
          </form>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>
                Password changed successfully!
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      <div
        className={`hidden md:flex flex-col gap-4 transition-all duration-700 ease-in-out max-h-screen overflow-y-auto ${
          isExpanded ? "lg:w-1/4" : "lg:w-1/2"
        }`}
      >
        {/* <RightPanel /> */}
      </div>
    </main>
  );
}