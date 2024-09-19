import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const SearchingAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl shadow-lg border border-gray-100 mb-4">
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
        <Loader2 className="w-14 h-14 text-blue-500" />
      </motion.div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">
        Search in Progress
      </h3>
      <p className="text-sm text-gray-600 text-center max-w-md leading-relaxed">
        This may take a few moments, but the results will be worth the wait!
      </p>
      {/* <motion.div
        className="mt-6 flex space-x-2"
        animate={{
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
      </motion.div> */}
    </div>
  );
};

export default SearchingAnimation;
