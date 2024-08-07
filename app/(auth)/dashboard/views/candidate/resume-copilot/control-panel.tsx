import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Save, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ControlPanelProps {
  onCreateResume: () => void;
  onSaveVersion: () => void;
  onOpenChat: () => void;
  isChatButtonExpanded: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onCreateResume,
  onSaveVersion,
  onOpenChat,
  isChatButtonExpanded,
}) => {
  const buttonVariants = {
    initial: { width: "46px" },
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
    isExpanded?: boolean;
  }> = ({ onClick, icon, text, isExpanded = false }) => (
    <motion.div
      initial="initial"
      whileHover="hover"
      animate={isExpanded ? "hover" : "initial"}
      className="flex justify-end"
    >
      <motion.button
        onClick={onClick}
        className={`
          ${isExpanded 
            ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" 
            : "bg-blue-500 hover:bg-blue-600"
          }
          text-white p-3 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:scale-105 flex items-center justify-end overflow-hidden
          ${isExpanded ? "ring-2 ring-white ring-opacity-50" : ""}
        `}
        variants={buttonVariants}
      >
        <motion.span
          className="mr-2 overflow-hidden whitespace-nowrap text-sm"
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
        text="Export Resume"
      />
      <ButtonWrapper
        onClick={onSaveVersion}
        icon={<Save className="h-5 w-5" />}
        text="Save Version"
      />
      <ButtonWrapper
        onClick={onOpenChat}
        icon={<MessageCircle className="h-5 w-5" />}
        text={isChatButtonExpanded ? "New Message" : "Open Chat"}
        isExpanded={isChatButtonExpanded}
      />
    </div>
  );
};

export default ControlPanel;