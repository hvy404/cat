import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Save, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ControlPanelProps {
  onCreateResume: () => void;
  onSaveVersion: () => void;
  onOpenChat: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onCreateResume,
  onSaveVersion,
  onOpenChat,
}) => {
  const buttonVariants = {
    initial: { width: "48px" },
    hover: {
      width: "180px",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const textVariants = {
    initial: { opacity: 0, width: 0 },
    hover: {
      opacity: 1,
      width: "auto",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const ButtonWrapper: React.FC<{
    onClick: () => void;
    icon: React.ReactNode;
    text: string;
  }> = ({ onClick, icon, text }) => (
    <motion.div
      initial="initial"
      whileHover="hover"
      animate="initial"
      className="flex justify-end"
    >
      <motion.button
        onClick={onClick}
        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:scale-105 flex items-center justify-end overflow-hidden"
        variants={buttonVariants}
      >
        <motion.span
          className="mr-2 overflow-hidden whitespace-nowrap"
          variants={textVariants}
        >
          {text}
        </motion.span>
        <span className="flex items-center justify-center w-5 h-5 flex-shrink-0">
          {icon}
        </span>
      </motion.button>
    </motion.div>
  );

  return (
    <div className="fixed top-1/2 right-4 transform -translate-y-1/2 flex flex-col space-y-4 z-10">
      <ButtonWrapper
        onClick={onCreateResume}
        icon={<Download className="h-5 w-5" />}
        text="Create Resume"
      />
      <ButtonWrapper
        onClick={onSaveVersion}
        icon={<Save className="h-5 w-5" />}
        text="Save Version"
      />
      <ButtonWrapper
        onClick={onOpenChat}
        icon={<MessageCircle className="h-5 w-5" />}
        text="Open Chat"
      />
    </div>
  );
};

export default ControlPanel;
