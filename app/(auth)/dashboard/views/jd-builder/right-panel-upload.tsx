import { useState, useEffect } from "react";
import useStore from "@/app/state/useStore";
import { motion } from "framer-motion";
import { getWelcomeUploadMessage } from "./lib/welcome-message";
import { BotIcon } from "lucide-react";
import SOWUploader from "./lib/sow-uploader/upload";

/* This component is responsible for rendering the right panel of the JD Builder wizard for the first step.
 * SOWUploader component is the upload form and the logic that initiates the parsing process.
 */

export default function JDBuilderRightUpload() {
  const { jdBuilderWizard, setJDBuilderWizard, updateJDBuilderWizardStep } =
    useStore();
  const [selectedMessage, setSelectedMessage] = useState("");

  useEffect(() => {
    const fetchMessage = async () => {
      const message = await getWelcomeUploadMessage();
      setSelectedMessage(message);
    };

    fetchMessage();
  }, []);

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

  return (
    <div className="flex flex-col w-full gap-4">
      {/* Animate the container for the first message */}
      <motion.div
        className="flex flex-col w-3/4 border border-1 border-dashed border-gray-200 hover:border-gray-300/50 rounded-md mx-auto"
        variants={messageVariants}
        initial="hidden"
        custom={0} // No delay for the first message
        animate="visible"
      >
        <div className="flex flex-row items-center bg-gray-100 m-1.5 rounded-md p-4 gap-4">
          <BotIcon className="w-8 h-8 text-gray-500 flex-shrink-0" />
          <p className="text-gray-700 leading-7 text-sm">{selectedMessage}</p>
        </div>
      </motion.div>

      {/* Animate the container for the second message */}
      {jdBuilderWizard.sowFile.length === 0 && (
      <motion.div
        className="flex flex-col w-3/4 border border-1 border-dashed border-gray-200 hover:border-gray-300/50 rounded-md mx-auto"
        variants={messageVariants}
        initial="hidden"
        custom={3} // Delayed animation for the second message
        animate="visible"
      >
        <SOWUploader />
      </motion.div>
      )}
    </div>
  );
}
