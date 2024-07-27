import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
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
      <AlertDialogContent className="bg-white max-w-2xl p-8 rounded-lg shadow-lg border border-gray-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-sans font-bold text-2xl text-gray-800 mb-4">
            Let's Confirm Your Details
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 space-y-6">
            <p className="text-base">
              We've extracted information from your resume. Please take a moment to verify its accuracy.
            </p>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <p className="text-gray-700 font-medium">
                A complete and accurate profile helps our AI provide better job matches tailored to your skills and experiences.
              </p>
            </div>
            <div className="mt-6">
              <h3 className="font-semibold text-lg text-gray-700 mb-3">The process:</h3>
              <ul className="space-y-3">
                {[
                  "Click Review My Profile to access a form where you can verify and adjust your information.",
                  "Once confirmed, you will gain access to your personalized dashboard.",
                  "You can modify, add, or remove information at any time from your dashboard.",
                  "Access AI-powered writing and resume assistance tools to refine your professional story."
                ].map((step, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="text-gray-400 mr-2 mt-1 flex-shrink-0" size={18} />
                    <span className="text-sm text-gray-600">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8">
          <AlertDialogAction 
            onClick={props.beginStartOnboarding}
            className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center text-sm"
          >
            Review My Profile
            <ArrowRight className="ml-2" size={16} />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default CandidateOnboardingDialog;