import { useUser } from "@clerk/nextjs";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Briefcase, Shield, Zap } from "lucide-react";
import { manageOnboardDialog2 } from "@/lib/candidate/onboarding-tip-resume";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface InitialInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InitialInfoDialog({
  open,
  onOpenChange,
}: InitialInfoDialogProps) {
  const { user } = useUser();
  const [dontShowAgain, setDontShowAgain] = useState(true);

  const handleDismiss = async () => {
    try {
      if (dontShowAgain) {
        await manageOnboardDialog2();
        if (user) {
          await user.reload();
        }
      }
      onOpenChange(false);
    } catch (error) {
      // TODO: Display error
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md bg-white dark:bg-gray-900">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-4">
            Welcome to Your Career Storyboard
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center mb-6 text-gray-600 dark:text-gray-400">
            Elevate your job search with intelligent, personalized career
            management.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <Zap className="w-5 h-5 text-gray-700 dark:text-gray-300 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Intelligent Matching
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our AI analyzes your experiences to identify optimal career
                opportunities tailored to your profile.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Briefcase className="w-5 h-5 text-gray-700 dark:text-gray-300 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Resume Coach Copilot
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't worry about employers seeing every detail you add here.
                Use our Resume Coach Copilot to build different resume versions,
                sharing only what you want for each specific role.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Comprehensive Insights
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The more details you provide, the better our AI can understand
                your unique background and identify ideal opportunities. Your
                full profile stays private unless you choose to share it.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-6">
          <Switch
            id="dont-show-again"
            checked={dontShowAgain}
            onCheckedChange={setDontShowAgain}
          />
          <Label
            htmlFor="dont-show-again"
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            Don't show this again
          </Label>
        </div>
        <AlertDialogFooter className="mt-8">
          <AlertDialogAction asChild>
            <Button
              onClick={handleDismiss}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900"
            >
              Begin Your Journey
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
