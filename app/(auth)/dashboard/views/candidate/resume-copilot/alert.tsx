import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Edit, History } from "lucide-react";

interface AlertProps {
  message: {
    recentEdit: string;
    nextAction: "add" | "remove" | "modify" | "none";
    nextReason: string;
  };
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

const Alert: React.FC<AlertProps> = ({
  message,
  isMinimized,
  onToggleMinimize,
}) => {
  const getActionIcon = (action: "add" | "remove" | "modify" | "none") => {
    const iconProps = {
      size: 20,
      className: "flex-shrink-0",
    };

    switch (action) {
      case "add":
        return (
          <Plus
            {...iconProps}
            className={`${iconProps.className} text-green-600`}
          />
        );
      case "remove":
        return (
          <Minus
            {...iconProps}
            className={`${iconProps.className} text-red-600`}
          />
        );
      case "modify":
        return (
          <Edit
            {...iconProps}
            className={`${iconProps.className} text-blue-600`}
          />
        );
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence>
        {isMinimized ? (
          <motion.button
            key="minimized"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-green-400 text-white text-xs font-medium py-1 px-3 rounded-full cursor-pointer ml-2 mb-2 hover:bg-green-500 transition-colors duration-200"
            onClick={onToggleMinimize}
          >
            Expand
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-50 shadow-sm rounded-lg overflow-hidden border border-green-100 mb-2"
          >
            <div className="flex flex-col p-3">
              <button
                className="self-end mb-2 text-green-600 text-xs font-medium hover:text-green-700 transition-colors duration-200"
                onClick={onToggleMinimize}
              >
                Dismiss
              </button>
              <div className="flex items-start mb-2">
                <History
                  size={20}
                  className="flex-shrink-0 text-green-600 mt-0.5 mr-2"
                />
                <p className="text-green-700 text-xs font-medium">
                  <span className="font-semibold mr-1">Recent:</span>{" "}
                  {message.recentEdit}
                </p>
              </div>
              <div className="flex items-start">
                <div className="mt-0.5 mr-2">
                  {getActionIcon(message.nextAction)}
                </div>
                <p className="text-green-700 text-xs font-medium">
                  <span className="font-semibold mr-1">Next Steps:</span>
                  {message.nextReason}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Alert;
