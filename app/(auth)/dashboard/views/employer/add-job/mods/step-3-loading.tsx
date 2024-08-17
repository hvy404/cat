import React from "react";
import { Loader } from "lucide-react";
import { motion } from "framer-motion";

interface WaitingStateProps {
  isFinalizing: boolean;
  isProcessingComplete: boolean;
  showSuccess: boolean;
  goToDashboard: () => void;
  countdown: number;
}

const WaitingState: React.FC<WaitingStateProps> = ({
  isFinalizing,
  isProcessingComplete,
  showSuccess,
  goToDashboard,
  countdown,
}) => {
  return (
    <div className="p-8 rounded-lg border border-1 border-gray-200 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg mx-auto"
      >
        {isFinalizing ? (
          <div className="flex flex-col items-center space-y-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="relative w-24 h-24"
            >
              <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-30"></div>
              <div className="absolute inset-2 bg-blue-100 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader className="w-12 h-12 text-blue-500" />
              </div>
            </motion.div>
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">
              Processing Your Opportunity
            </h2>
            <p className="text-center text-gray-600 leading-relaxed text-sm">
              We're extracting key signals from your job description to power
              precise candidate matching. Once complete, your opportunity will
              go live on the platform, optimized for maximum impact and
              visibility in our talent ecosystem.
            </p>
          </div>
        ) : showSuccess ? (
          <div className="flex flex-col items-center space-y-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="bg-green-100 p-6 rounded-full"
            >
              <svg
                className="w-16 h-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">
              Success!
            </h2>
            <p className="text-center text-gray-600 leading-relaxed text-sm">
              Your job opportunity has been successfully added to our platform.
              It's now primed to attract top talent. We'll notify you promptly
              when we identify potential matches.
            </p>
            <p className="text-center text-gray-600 leading-relaxed text-sm">
              Redirecting to dashboard in {countdown} seconds...
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToDashboard}
              className="mt-4 bg-blue-600 text-white font-semibold py-3 px-8 rounded-md shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 hover:bg-blue-700"
            >
              View Dashboard
            </motion.button>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
};

export default WaitingState;
