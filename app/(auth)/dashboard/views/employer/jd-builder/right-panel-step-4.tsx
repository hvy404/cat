import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Command, Slash } from "lucide-react";

const JDBuilderRightStep4 = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-[90vh] p-6 overflow-auto flex flex-col justify-between bg-gradient-to-br from-gray-50 to-white"
    >
      <div>
        <motion.h2
          variants={itemVariants}
          className="text-xl font-bold text-gray-900 mb-6 tracking-tight"
        >
          Your Job Description is Ready
        </motion.h2>

        <motion.div
          variants={itemVariants}
          className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-500 rounded-full p-1.5">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <p className="text-blue-700 font-semibold text-base">
              Draft Complete
            </p>
          </div>
          <p className="text-gray-700 mb-4 text-sm leading-relaxed">
            Your job description draft is now ready for your review. Take a
            moment to refine and perfect it to attract the best candidates.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-gray-50 rounded-xl p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Pro Editing Tips
          </h3>
          <div className="space-y-4">
            <div className="flex items-start bg-white p-4 rounded-lg shadow-sm">
              <Command className="w-6 h-6 text-gray-500 mr-3 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-800 mb-1 text-sm">
                  Smart Auto-complete
                </p>
                <p className="text-gray-600 text-xs">
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-xs font-mono shadow-sm">
                    ++
                  </kbd>{" "}
                  for AI-powered sentence completion
                </p>
              </div>
            </div>
            <div className="flex items-start bg-white p-4 rounded-lg shadow-sm">
              <Slash className="w-6 h-6 text-gray-500 mr-3 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-800 mb-1 text-sm">
                  Advanced Formatting
                </p>
                <p className="text-gray-600 text-xs">
                  Type{" "}
                  <kbd className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-xs font-mono shadow-sm">
                    /
                  </kbd>{" "}
                  to access a wide range of formatting options
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default JDBuilderRightStep4;
