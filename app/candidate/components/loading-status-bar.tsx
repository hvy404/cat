import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";

const EnhancedLoadingComponent = ({ workerStatus }: { workerStatus?: string }) => {
  const [progress, setProgress] = useState(0);
  const [lastPollTime, setLastPollTime] = useState(Date.now());

  useEffect(() => {
    const simulateProgress = () => {
      const now = Date.now();
      const timeSinceLastPoll = now - lastPollTime;
      
      if (timeSinceLastPoll >= 10000) {
        setProgress(prevProgress => Math.min(prevProgress + Math.random() * 15 + 5, 99)); 
        setLastPollTime(now);
      } else {
        setProgress(prevProgress => {
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
    <div className="flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <Progress value={progress} className="w-full" />
        <p className="mt-4 text-sm text-gray-600">
          {getMessage()} {progress.toFixed(1)}%
        </p>
      </div>
    </div>
  );
};

export default EnhancedLoadingComponent;