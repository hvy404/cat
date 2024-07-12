import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CandidateOnboardingDialogProps {
  onboardingDialogOpen: boolean;
  onboardingDialogOpenClose: () => void;
  beginStartOnboarding: () => void;
}

function CandidateOnboardingDialog(props: CandidateOnboardingDialogProps) {
  return (
    <AlertDialog
      open={props.onboardingDialogOpen}
      onOpenChange={props.onboardingDialogOpenClose}
    >
      <AlertDialogContent className="bg-gray-100 max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-merriweather font-normal text-2xl text-gray-700 mb-4">
            Let's Confirm Your Details
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 space-y-4">
            <p>
              We've extracted information from your resume. Please take a moment to verify its accuracy.
            </p>
            <p>
              A complete and accurate profile helps our AI provide better job matches tailored to your skills and experiences.
            </p>
            <p className="font-semibold mt-6">
              The process:
            </p>
            <p>
              After clicking "Review My Profile," you'll be directed to a form where you can verify and adjust your information. Once confirmed, you'll gain access to your personalized dashboard.
            </p>
            <p>
              Once you're dashboard is ready, you'll have the flexibility to modify, add, or remove information at any time. You'll also find AI-powered writing and resume assistance tools to help refine your professional story.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogAction 
            onClick={props.beginStartOnboarding}
            className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Review My Profile
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default CandidateOnboardingDialog;