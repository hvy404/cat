import React, { useState } from "react";
import { Upload, FileEdit, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ResumeUpload } from "@/app/(auth)/dashboard/views/candidate/main-post-upload";
import { CreateResumeForm } from "@/app/(auth)/dashboard/views/candidate/main-post-manual-resume";
import { useUser } from "@clerk/nextjs";
import useStore from "@/app/state/useStore";

export function MainCandidatePostSignup() {
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateResume, setShowCreateResume] = useState(false);
  const { user } = useUser();
  const { setCandidateRightPanelView } = useStore();

  const cuid = user?.publicMetadata?.aiq_cuid as string;

  const handleShowUpload = () => {
    setShowUpload(true);
    setCandidateRightPanelView("resumeUpload");
  };

  const handleShowCreateResume = () => {
    setShowCreateResume(true);
    setCandidateRightPanelView("createResume");
  };

  if (showUpload) {
    return (
      <ResumeUpload
        onBack={() => {
          setShowUpload(false);
          setCandidateRightPanelView("welcome");
        }}
        email={user?.primaryEmailAddress?.emailAddress || ""}
        candidateId={cuid}
      />
    );
  }

  if (showCreateResume) {
    return (
      <CreateResumeForm
        onBack={() => {
          setShowCreateResume(false);
          setCandidateRightPanelView("welcome");
        }}
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-12 p-12 max-w-2xl w-full"
      >
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
          Let's Kickstart Your Career Pipeline
        </h1>
        <p className="text-sm text-gray-600 mt-4">
          Choose how you'd like to begin building your professional profile.
        </p>
        <div className="space-y-6 mt-8">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full py-6 text-base font-semibold rounded-xl shadow-md transition-all duration-200 ease-in-out bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              variant="default"
              onClick={handleShowUpload}
            >
              <Upload className="mr-3 h-5 w-5" />
              Upload Your Existing Resume
              <ArrowRight className="ml-3 h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full py-6 text-base font-semibold rounded-xl shadow-md transition-all duration-200 ease-in-out border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50"
              variant="outline"
              onClick={handleShowCreateResume}
            >
              <FileEdit className="mr-3 h-5 w-5" />
              Create a New Resume from Scratch
              <ArrowRight className="ml-3 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
        <p className="text-xs text-gray-500 mt-8">
          Don't worry, you can always make modifications later. For now, let's
          get started!
        </p>
      </motion.div>
    </div>
  );
}
