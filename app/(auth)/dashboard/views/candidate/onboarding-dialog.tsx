import React from "react";
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
import { Smile, CheckCircle, ArrowRight } from "lucide-react";

interface CandidateOnboardingDialogProps {
  onboardingDialogOpen: boolean;
  onboardingDialogOpenClose: () => void;
  beginStartOnboarding: () => void;
}

export default function CandidateOnboardingDialog({
  onboardingDialogOpen,
  onboardingDialogOpenClose,
  beginStartOnboarding,
}: CandidateOnboardingDialogProps) {
  return (
    <AlertDialog
      open={onboardingDialogOpen}
      onOpenChange={onboardingDialogOpenClose}
    >
      <AlertDialogContent className="max-w-md bg-white dark:bg-gray-900">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-4 flex items-center justify-center">
            <Smile
              className="mr-2 text-gray-600 dark:text-gray-400"
              size={28}
            />
            Welcome Aboard!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center mb-6 text-gray-600 dark:text-gray-400">
            We're excited to have you join us! Let's make sure your profile
            shines.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-800 p-4 rounded-md border border-green-200 dark:border-green-700">
            <h2 className="font-medium text-green-800">Here's what next:</h2>
            <p className="text-sm text-green-800 dark:text-green-300">
              Our AI has analyzed your uploaded resume. Let's
              quickly review and confirm a few key details to ensure your
              profile is accurate and ready to showcase your talents.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 text-sm">
              A few features you'll love:
            </h3>
            <ul className="space-y-3">
              {[
                "Review and fine-tune your profile information",
                "Utilize AI-powered tools to enhance your professional story",
                "Get continuously matched to new opportunities tailored to your strengths",
              ].map((step, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-gray-700 dark:text-gray-300 flex-shrink-0 mt-1 mr-3" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {step}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <AlertDialogFooter className="mt-8">
          <AlertDialogAction asChild>
            <Button
              onClick={beginStartOnboarding}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 flex items-center justify-center"
            >
              Review & Verify Information
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
