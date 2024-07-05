import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "@/app/state/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LucideIcon,
  FileText,
  Clock,
  Search,
  UserCheck,
  ArrowRight,
  Zap,
  Target,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface ProcessingStepProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const MotionCard = motion(Card);

const LoadingAnimation = () => (
  <motion.div
    className="w-12 h-12 relative my-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
  >
    <motion.svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="#E5E7EB"
        strokeWidth="8"
      />
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="#D1D5DB"
        strokeWidth="8"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.svg>
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 text-gray-300"
      >
        <motion.rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="2"
          ry="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        <motion.rect
          x="9"
          y="9"
          width="6"
          height="6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1 }}
        />
        <motion.path
          d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        />
      </motion.svg>
    </motion.div>
  </motion.div>
);

const ProcessingStep: React.FC<ProcessingStepProps> = ({
  icon: Icon,
  title,
  description,
}) => (
  <div className="flex items-start space-x-3 text-gray-600">
    <div className="flex-shrink-0 mt-1">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h4 className="font-medium text-sm">{title}</h4>
      <p className="text-sm">{description}</p>
    </div>
  </div>
);

export default function AddJDStepOne() {
  const { addJD } = useStore();
  const [funFact, setFunFact] = useState("");

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const iconVariants = {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: { delay: 0.2, type: "spring", stiffness: 200 },
    },
  };

  const steps = [
    {
      icon: FileText,
      title: "Analyzing Content",
      description: "Extracting key information from your job description.",
    },
    {
      icon: Zap,
      title: "Matching Skills",
      description: "Identifying required skills and experience.",
    },
    {
      icon: Target,
      title: "Defining Criteria",
      description: "Setting up search parameters for candidate matching.",
    },
  ];

  const funFacts = [
    "Did you know? Our AI can process over 1,000 job descriptions per minute!",
    "Fun fact: The average hiring process takes 23 days. We're here to speed that up!",
    "Interesting: 75% of HR managers say AI will play a key role in recruitment in the next 5 years.",
    "Quick tip: Clear job descriptions lead to 47% more qualified applicants.",
  ];

  useEffect(() => {
    const factInterval = setInterval(() => {
      setFunFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
    }, 5000);

    return () => clearInterval(factInterval);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {!addJD.isProcessing ? (
        <MotionCard
          key="info"
          className="w-full bg-white text-gray-800 overflow-hidden shadow-lg border border-gray-200 hover:border-gray-300 transition-all duration-300"
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <CardHeader className="bg-gray-50 p-4 border-b border-gray-200">
            <CardTitle className="text-md font-medium flex items-center space-x-2 text-gray-800">
              <motion.div
                variants={iconVariants}
                initial="initial"
                animate="animate"
              >
                <FileText className="w-4 h-4 text-gray-700" />
              </motion.div>
              <span>Add Your Job Description</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-8">
            <motion.div
              className="text-gray-600 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm leading-relaxed">
                Streamline your hiring process with our advanced AI technology.
                Simply upload your job description, and our system will
                automatically extract key information, populate your forms, and
                start matching ideal candidates.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                {[
                  { icon: Clock, text: "Save hours on manual data entry" },
                  { icon: Search, text: "Intelligent candidate matching" },
                  {
                    icon: UserCheck,
                    text: "Build a continuous talent pipeline",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg"
                  >
                    <item.icon className="w-8 h-8 text-gray-600 mb-2" />
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            {/*             <div className="mt-6 text-center">
              <Button
                className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 flex items-center space-x-1 text-sm"
                onClick={() => {
                  // Navigate to upload page or open upload modal
                  console.log("Navigate to upload page");
                }}
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div> */}
          </CardContent>
        </MotionCard>
      ) : (
        <MotionCard
          key="processing"
          className="w-full bg-white text-gray-800 shadow-lg border border-gray-200 overflow-hidden"
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
            <CardTitle className="text-md font-medium flex items-center space-x-2 text-gray-800">
              <Zap className="w-6 h-6 text-gray-600" />
              <span>Processing Job Description</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <motion.div
              className="text-gray-700 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm leading-relaxed">
                Hang tight! Our AI is working its magic on your job description.
                We're analyzing every detail to find your perfect candidates.
              </p>
            </motion.div>

            <div className="space-y-4 mt-6">
              {steps.map((step, index) => (
                <ProcessingStep key={index} {...step} />
              ))}
            </div>

            <motion.div
              className="mt-6 bg-gray-50 p-3 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h4 className="text-sm font-semibold mb-2 flex items-center">
                <ChevronRight className="w-4 h-4 mr-1 text-gray-500" />
                Did You Know?
              </h4>
              <p className="text-sm text-gray-600">{funFact}</p>
            </motion.div>

            <div className="flex justify-center items-center mt-6">
              <LoadingAnimation />
            </div>
          </CardContent>
        </MotionCard>
      )}
    </AnimatePresence>
  );
}
