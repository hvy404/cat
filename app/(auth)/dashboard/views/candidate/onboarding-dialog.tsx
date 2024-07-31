import React from 'react';
import { CheckCircle, ArrowRight, Smile } from 'lucide-react';
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
      <AlertDialogContent className="bg-white max-w-2xl p-8 rounded-lg shadow-lg border border-gray-200 transition-all duration-300 ease-in-out">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-sans font-bold text-3xl text-gray-800 mb-4 flex items-center">
            <Smile className="mr-2 text-gray-600" size={32} />
            Welcome Aboard!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-700 space-y-6">
            <p className="text-lg">
              We're excited to have you join us! We've gathered some information from your resume to get you started. Let's make sure everything looks good.
            </p>
            <div className="bg-gray-50 p-5 rounded-md border border-gray-200 shadow-sm">
              <p className="text-gray-800 font-medium">
                A complete profile helps our AI find the perfect job matches for your unique skills and experiences. Let's make your profile shine!
              </p>
            </div>
            <div className="mt-6">
              <h3 className="font-semibold text-xl text-gray-700 mb-4">Here's what to expect:</h3>
              <ul className="space-y-4">
                {[
                  "Review and fine-tune your profile information",
                  "Access your personalized dashboard",
                  "Update your information anytime",
                  "Utilize AI-powered tools to enhance your professional story"
                ].map((step, index) => (
                  <li key={index} className="flex items-start group">
                    <CheckCircle className="text-gray-400 mr-3 mt-1 flex-shrink-0 transition-all duration-300 ease-in-out group-hover:text-gray-600" size={22} />
                    <span className="text-base text-gray-600 group-hover:text-gray-800 transition-all duration-300 ease-in-out">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8">
          <AlertDialogAction 
            onClick={props.beginStartOnboarding}
            className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-6 rounded-md transition duration-300 ease-in-out flex items-center justify-center text-lg shadow-md hover:shadow-lg"
          >
            Let's Get Started
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" size={20} />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default CandidateOnboardingDialog;