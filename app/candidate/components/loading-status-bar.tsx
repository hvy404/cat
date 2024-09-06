import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const EnhancedLoadingComponent = ({
  workerStatus,
}: {
  workerStatus?: string;
}) => {
  const [progress, setProgress] = useState(0);
  const [lastPollTime, setLastPollTime] = useState(Date.now());

  useEffect(() => {
    const simulateProgress = () => {
      const now = Date.now();
      const timeSinceLastPoll = now - lastPollTime;

      if (timeSinceLastPoll >= 10000) {
        setProgress((prevProgress) =>
          Math.min(prevProgress + Math.random() * 15 + 5, 99)
        );
        setLastPollTime(now);
      } else {
        setProgress((prevProgress) => {
          const smallIncrement = Math.random() * 0.3 + 0.1;
          return Math.min(prevProgress + smallIncrement, 99);
        });
      }
    };

    const intervalId = setInterval(simulateProgress, 1000);

    return () => clearInterval(intervalId);
  }, [lastPollTime]);

  const getMessage = () => {
    if (progress < 10) return "Reading your resume...";
    if (progress < 20) return "Reviewing your professional story";
    if (progress < 40) return "Analyzing your career highlights";
    if (progress < 60) return "Uncovering your hidden talents";
    if (progress < 80) return "Connecting the dots in your experience";
    return "Preparing to reveal your professional superpowers";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-[80vh] bg-white"
    >
      <div className="text-center space-y-8 p-12 max-w-2xl w-full bg-white rounded-xl shadow-lg border border-gray-100">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-6"
        >
          <Loader2 className="w-14 h-14 text-blue-500 mx-auto" />
        </motion.div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          AI-Powered Analysis in Progress
        </h2>
        <Progress value={progress} className="w-full" />
        <p className="mt-4 text-md text-gray-600">
          {getMessage()} {progress.toFixed(1)}%
        </p>
        <p className="text-sm text-gray-500 mt-8">
          We're working hard to provide you with the best results. This may take
          a few moments, but it will be worth the wait!
        </p>
      </div>
    </motion.div>
  );
};

export default EnhancedLoadingComponent;
