import { useEffect } from "react";
import useStore from "@/app/state/useStore";
import { motion } from "framer-motion";
import { BotIcon } from "lucide-react";

export default function JDBuilderRightStep2() {
  const { jdBuilderWizard, setJDBuilderWizard, updateJDBuilderWizardStep } =
    useStore();

  // Define the animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.5,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      },
    }),
  };

  const stepMessages = [
    "Your PWS/SOW documents have been successfully uploaded. We are currently processing them to identify the personnel roles. Please allow a few minutes for this to complete.",
    "We are currently finalizing the analysis of your documents. Thank you for your patience; we will have the necessary personnel roles identified shortly.",
  ];

  return (
    <div className="flex flex-col w-full gap-4">
      <motion.div
        className="flex flex-col w-3/4 border border-1 border-dashed border-gray-200 hover:border-gray-300/50 rounded-md mx-auto"
        variants={messageVariants}
        initial="hidden"
        custom={0} // No delay for the first message
        animate="visible"
      >
        <div className="flex flex-row items-center bg-gray-100 m-1.5 rounded-md p-4 gap-4">
          <BotIcon className="w-8 h-8 text-gray-500 flex-shrink-0" />
          <p className="text-gray-700 leading-7 text-sm">{stepMessages[0]}</p>
        </div>
      </motion.div>

      <motion.div
        className="flex flex-col w-3/4 border border-1 border-dashed border-gray-200 hover:border-gray-300/50 rounded-md mx-auto"
        variants={messageVariants}
        initial="hidden"
        custom={240}
        animate="visible"
      >
        <div className="flex flex-row items-center bg-gray-100 m-1.5 rounded-md p-4 gap-4">
          <BotIcon className="w-8 h-8 text-gray-500 flex-shrink-0" />
          <p className="text-gray-700 leading-7 text-sm">{stepMessages[1]}</p>
        </div>
      </motion.div>
    </div>
  );
}
