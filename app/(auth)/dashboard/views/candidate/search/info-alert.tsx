import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
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
import { Search, Target, RefreshCw } from "lucide-react";
import { manageSearchTipAlert } from "@/lib/candidate/onboarding-tip-resume";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SearchFeatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchFeatureDialog({
  open,
  onOpenChange,
}: SearchFeatureDialogProps) {
  const { user } = useUser();

  const [dontShowAgain, setDontShowAgain] = useState(true);

  const handleDismiss = async () => {
    try {
      if (dontShowAgain) {
        await manageSearchTipAlert();
        if (user) {
          await user.reload(); // Reload the user data to get the updated metadata
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
            Discover Your Next Opportunity
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center mb-6 text-gray-600 dark:text-gray-400">
            Take control of your job search with our powerful Search feature,
            tailored to your professional story.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <Search className="w-5 h-5 text-gray-700 dark:text-gray-300 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Customized Search
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Explore open opportunities that align with your skills and
                experience. Our search engine curates results based on your
                professional profile.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Target className="w-5 h-5 text-gray-700 dark:text-gray-300 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Precision Matching
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get results that matter. Our AI cross-references your resume and
                professional story to ensure every opportunity is relevant to
                your career path.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <RefreshCw className="w-5 h-5 text-gray-700 dark:text-gray-300 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Adaptive Intelligence
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our platform evolves with you, continuously refining its understanding 
                of your career goals. The more you interact, the smarter our search 
                becomes at understanding your preferences.
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
              Start Searching
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}