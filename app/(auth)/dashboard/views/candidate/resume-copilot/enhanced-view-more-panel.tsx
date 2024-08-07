import React from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const EnhancedViewMorePanel = ({
  message,
  onClose,
}: {
  message: { suggestion: string; reasoning: string };
  onClose: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full bg-slate-800 text-gray-200 rounded-lg shadow-lg overflow-hidden"
    >
      <div className="flex justify-between items-center p-4">
        <h3 className="text-lg font-semibold">Next Steps</h3>
        <Button
          onClick={onClose}
          variant="link"
          size="sm"
          className="text-gray-500 hover:text-gray-200"
        >
          <X size={20} />
        </Button>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-200">Suggestion</h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            {message.suggestion}
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-200">Reasoning</h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            {message.reasoning}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedViewMorePanel;
