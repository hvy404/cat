import React, { useState, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";
import { BotIcon, Upload } from "lucide-react";
import useStore from "@/app/state/useStore";
import { getWelcomeUploadMessage } from "./lib/welcome-message";
import SOWUploader from "./lib/sow-uploader/upload";

export default function JDBuilderRightUpload() {
  const { jdBuilderWizard } = useStore();
  const [selectedMessage, setSelectedMessage] = useState("");

  useEffect(() => {
    const fetchMessage = async () => {
      const message = await getWelcomeUploadMessage();
      setSelectedMessage(message);
    };

    fetchMessage();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const MessageCard = ({ icon: Icon, content }: { icon: React.ElementType; content: ReactNode }) => (
    <motion.div
      className="w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
      variants={itemVariants}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-full">
            <Icon className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      className="flex flex-col items-center h-full justify-center p-6 md:p-8 lg:p-12 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <MessageCard 
        icon={BotIcon} 
        content={
          <div className="flex items-center">
            <span className="text-sm text-gray-600 leading-relaxed">{selectedMessage}</span>
          </div>
        } 
      />
      
      {jdBuilderWizard.sowFile.length === 0 && (
        <motion.div
          className="w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          variants={itemVariants}
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <Upload className="w-4 h-4 text-gray-600" />
              </div>
              <h2 className="text-md font-semibold text-gray-800">Upload SOW File</h2>
            </div>
            <SOWUploader />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}