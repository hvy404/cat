import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "@/app/state/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const MotionCard = motion(Card);

const LoadingAnimation = () => (
  <motion.div
    className="w-16 h-16 relative my-8"
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
        stroke="#D1D5DB"  // Changed from #3B82F6 to #D1D5DB (Tailwind's gray-300)
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
        className="w-8 h-8 text-gray-300"  // Changed from text-blue-500 to text-gray-300
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

export default function AddJDStepOne() {
  const { addJD } = useStore();

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

  return (
    <AnimatePresence mode="wait">
      {!addJD.isProcessing ? (
        <MotionCard
          key="upload"
          className="w-full bg-white text-gray-700 overflow-hidden shadow-sm border border-gray-200"
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <CardHeader className="bg-gray-100 p-4">
            <CardTitle className="text-base font-semibold flex items-center space-x-2">
              <motion.div
                variants={iconVariants}
                initial="initial"
                animate="animate"
              >
                <FileText className="w-5 h-5 text-gray-600" />
              </motion.div>
              <span>Upload Your Job Description</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <motion.div
              className="text-gray-600 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm">
                Simply upload a PDF or Word file of your job description, and
                we'll take care of the rest.
              </p>
              <p className="text-sm">
                Catalyst will automatically extract all the necessary details to
                help you find the perfect candidate.
              </p>
            </motion.div>
          </CardContent>
        </MotionCard>
      ) : (
        <MotionCard
          key="processing"
          className="w-full bg-white text-gray-700 shadow-sm border border-gray-200"
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <CardHeader className="bg-gray-100 p-4">
            <CardTitle className="text-base font-semibold flex items-center space-x-2">
              <span>Processing Your Job Description</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <motion.div
              className="text-gray-600 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm">
                Catalyst's AI is now analyzing your job description. This
                process typically takes less than a minute.
              </p>
              <p className="text-sm">
                Our advanced algorithms are extracting key requirements and
                preferences to identify your ideal candidates. Get ready for
                precise matches!
              </p>
            </motion.div>
            <div className="flex justify-center items-center mt-8">
              <LoadingAnimation />
            </div>
          </CardContent>
        </MotionCard>
      )}
    </AnimatePresence>
  );
}