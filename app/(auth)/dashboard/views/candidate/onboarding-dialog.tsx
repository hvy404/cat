import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Smile, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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
      <AlertDialogContent className="max-w-2xl bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <AlertDialogHeader>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <AlertDialogTitle className="text-2xl font-bold text-gray-900 tracking-tight flex items-center justify-center mb-2">
                <Smile className="mr-2 text-blue-500" size={28} />
                Welcome Aboard!
              </AlertDialogTitle>
            </motion.div>
            <AlertDialogDescription className="text-sm text-gray-600 mt-2 text-center max-w-lg mx-auto">
              We're excited to have you join us! Let's make sure your profile shines and opens doors to amazing opportunities.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-inner"
            >
              <h2 className="font-semibold text-blue-800 mb-2 text-base flex items-center">
                <Sparkles className="mr-2 text-blue-500" size={16} />
                Here's what's next:
              </h2>
              <p className="text-sm text-blue-700 leading-relaxed text-left">
                Our AI has analyzed your uploaded resume. Let's quickly review and confirm a few key details to ensure your profile is accurate and ready to showcase your talents to top employers.
              </p>
            </motion.div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm text-left">
                Features you'll love once you're logged in:
              </h3>
              <ul className="space-y-3">
                {[
                  "Review and fine-tune your profile information",
                  "Utilize AI-powered tools to enhance your professional story",
                  "Get continuously matched to new opportunities tailored to your strengths",
                ].map((step, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="flex items-start bg-white p-3 rounded-lg shadow-xs"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5 mr-3" />
                    <span className="text-sm text-gray-700">{step}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6"
          >
            <Button
              onClick={beginStartOnboarding}
              className="w-full py-4 text-base font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              Review & Verify Information
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
