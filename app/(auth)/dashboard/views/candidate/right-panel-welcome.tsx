import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Smile,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Rocket,
  FileEdit,
} from "lucide-react";
import useStore from "@/app/state/useStore";

const steps = [
  {
    icon: Zap,
    title: "Quality Matches",
    description:
      "Our AI processes hundreds of criteria to deliver high-quality job matches.",
  },
  {
    icon: Target,
    title: "Comprehensive Approach",
    description:
      "We consider your skills, goals, and preferences for a holistic match.",
  },
  {
    icon: Rocket,
    title: "Next Steps",
    description:
      "Enrich your profile to enhance your match results and opportunities.",
  },
];

export default function CandidateDashboardRightPanelWelcome() {
  const { candidateDashboard } = useStore();
  const [showContent, setShowContent] = useState(false);

  const renderContent = () => {
    switch (candidateDashboard.rightPanelView) {
      case "resumeUpload":
        return <ResumeUploadInfo />;
      case "createResume":
        return <CreateResumeInfo />;
      default:
        return (
          <>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center justify-center mb-2">
                <Smile className="mr-2 text-blue-500" size={28} />
                Welcome to Your Career Journey
              </h2>
            </motion.div>
            <p className="text-base text-gray-600 mt-2 max-w-xl mx-auto leading-relaxed">
              You're about to embark on an exciting path. Let's explore how our
              AI-powered platform can help you discover your perfect career
              opportunity.
            </p>

            <AnimatePresence mode="wait">
              {!showContent ? (
                <motion.div
                  key="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    onClick={() => setShowContent(true)}
                    className="px-6 py-3 text-base font-semibold rounded-full shadow-lg transition-all duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transform hover:scale-105"
                  >
                    Discover How It Works
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  className="mt-8 space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-lg">
                    <h3 className="font-bold text-blue-800 mb-3 text-lg flex items-center">
                      <Sparkles className="mr-2 text-blue-500" size={20} />
                      Our Intelligent Matching Process
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Your unique profile is the key to unlocking personalized
                      job opportunities. Our advanced AI technology carefully
                      considers your skills, experiences, and aspirations to
                      connect you with roles that align perfectly with your
                      professional goals. By leveraging this intelligent
                      matching process, you'll discover positions tailored
                      specifically to your strengths and ambitions, making your
                      job search more efficient and rewarding.{" "}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {steps.map((step, index) => (
                      <motion.div
                        key={index}
                        className="bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 flex flex-col items-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div className="flex justify-center mb-3">
                          <step.icon className="w-6 h-6 text-blue-500" />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm text-center">
                          {step.title}
                        </h4>
                        <p className="text-sm text-gray-600 text-center">
                          {step.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        );
    }
  };

  return (
    <div className="relative h-full w-full p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
      <motion.div
        className="text-center space-y-6 max-w-2xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}

function ResumeUploadInfo() {
  return (
    <div className="text-center space-y-5 max-w-2xl relative z-10 bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-bold text-indigo-800 tracking-tight">
        Elevate Your Career with AI-Powered Resume Analysis
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        Upload your resume to unlock the power of our AI-driven analysis,
        providing you with tailored job matches and personalized
        recommendations.
      </p>
      <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
        <Sparkles className="h-6 w-6 text-indigo-500 mx-auto mb-3" />
        <p className="text-sm text-indigo-700 font-medium leading-relaxed">
          Your professional story becomes the foundation for our AI-powered
          matching, connecting you with roles that align perfectly with your
          unique skills and experience.
        </p>
      </div>
      <p className="text-xs text-gray-500 mt-3 italic">
        You'll have full control to refine your professional story after this
        initial step, jumpstarting your journey to finding your ideal career
        opportunity.
      </p>
    </div>
  );
}

function CreateResumeInfo() {
  return (
    <div className="text-center space-y-5 max-w-2xl relative z-10 bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-bold text-indigo-800 tracking-tight">
        Craft Your Professional Story
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        Our guided process helps you build a compelling resume from scratch,
        tailored to the jobs you're interested in. We'll walk you through each
        step to collect the details of your professional journey.
      </p>
      <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
        <FileEdit className="h-6 w-6 text-indigo-500 mx-auto mb-3" />
        <p className="text-sm text-indigo-700 font-medium leading-relaxed">
          Once complete, our AI analyzes your information to match you with
          optimal roles and provides tools to tailor your resume for specific
          opportunities.
        </p>
      </div>
      <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
        <Sparkles className="h-6 w-6 text-blue-500 mx-auto mb-3" />
        <p className="text-sm text-blue-700 font-medium leading-relaxed">
          Your professional story becomes the foundation for our AI-powered
          matching, connecting you with roles that align perfectly with your
          unique skills and experience.
        </p>
      </div>
      <p className="text-xs text-gray-500 mt-3 italic">
        After completing this process, you'll be redirected to your dashboard
        where you can further refine and optimize your profile.
      </p>
    </div>
  );
}
