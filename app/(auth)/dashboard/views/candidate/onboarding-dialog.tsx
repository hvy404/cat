import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

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
      <AlertDialogContent className="bg-gray-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-merriweather font-normal text-2xl text-gray-700">
            You're almost there!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 space-y-4">
            <p>
              Please verify that we read your resume correctly. A complete and
              accurate profile helps our AI understand your skills and
              experiences, providing better matches.
            </p>

            <p>
              <span className="font-semibold">PS</span>: When requested by
              employers, we will share the resume you uploaded. After this step,
              feel free to check out our AI assistant in your dashboard. It can
              help you polish up your resume anytime you want. You can then
              choose this spruced-up version as the one to share with potential
              employers.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={props.beginStartOnboarding}>
            Let's get started
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default CandidateOnboardingDialog;
