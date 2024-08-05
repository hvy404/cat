import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  Edit,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AlertProps {
  message: {
    recommendation: {
      action: "add" | "remove" | "modify" | "none";
      targetItem: string;
      rationale: string;
      implementation: string;
    };
    nextSteps: {
      priority: "High" | "Medium" | "Low";
      focus: string;
      guidance: string;
      progression: string;
    };
  };
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

const CustomAlert: React.FC<AlertProps> = ({
  message,
  isMinimized,
  onToggleMinimize,
}) => {
  const [showFullRecommendation, setShowFullRecommendation] = useState(false);
  const [showImplementation, setShowImplementation] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

  const getActionIcon = (action: "add" | "remove" | "modify" | "none") => {
    const iconProps = {
      size: 20,
      className: "flex-shrink-0",
    };

    switch (action) {
      case "add":
        return <Plus {...iconProps} className={`${iconProps.className} text-emerald-400`} />;
      case "remove":
        return <Minus {...iconProps} className={`${iconProps.className} text-red-400`} />;
      case "modify":
        return <Edit {...iconProps} className={`${iconProps.className} text-amber-400`} />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: "High" | "Medium" | "Low") => {
    switch (priority) {
      case "High":
        return "bg-red-500 bg-opacity-15 text-red-100 border border-red-400 border-opacity-30";
      case "Medium":
        return "bg-amber-500 bg-opacity-15 text-amber-100 border border-amber-400 border-opacity-30";
      case "Low":
        return "bg-emerald-500 bg-opacity-15 text-emerald-100 border border-emerald-400 border-opacity-30";
      default:
        return "bg-blue-500 bg-opacity-15 text-blue-100 border border-blue-400 border-opacity-30";
    }
  };

  const truncate = (str: string, n: number) => {
    return str.length > n ? str.substr(0, n - 1) + "..." : str;
  };

  return (
    <div className="w-full">
      <AnimatePresence>
        {isMinimized ? (
          <motion.button
            key="minimized"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md cursor-pointer shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2"
            onClick={onToggleMinimize}
          >
            <span>View AI Recommendation</span>
            <ChevronDown size={16} />
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <Alert className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-lg p-6 border border-blue-500 border-opacity-30 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <AlertTitle className="text-blue-100 font-bold text-xl">
                  AI Recommendation
                </AlertTitle>
                <button
                  className="text-blue-300 text-sm font-medium hover:text-blue-100 transition-colors duration-200 flex items-center space-x-1"
                  onClick={onToggleMinimize}
                >
                  <span>Minimize</span>
                  <ChevronUp size={16} />
                </button>
              </div>
              <AlertDescription>
                <div className="space-y-6">
                  <div className="bg-blue-900 bg-opacity-30 rounded-lg p-5 border border-blue-700 border-opacity-50 shadow-inner">
                    <div className="flex items-start">
                      <div className="mt-1 mr-4">
                        {getActionIcon(message.recommendation.action)}
                      </div>
                      <div>
                        <h4 className="text-blue-100 font-semibold mb-3">Recommendation</h4>
                        <p className="text-blue-200 text-sm mb-3 leading-relaxed">
                          {showFullRecommendation
                            ? message.recommendation.rationale
                            : truncate(message.recommendation.rationale, 150)}
                        </p>
                        {message.recommendation.rationale.length > 150 && (
                          <button
                            onClick={() => setShowFullRecommendation(!showFullRecommendation)}
                            className="text-blue-300 text-sm font-medium flex items-center hover:text-blue-100 transition-colors duration-200 mb-3"
                          >
                            {showFullRecommendation ? "Show Less" : "Show More"}
                            <ChevronRight size={16} className={`ml-1 transform transition-transform ${showFullRecommendation ? 'rotate-90' : ''}`} />
                          </button>
                        )}
                        <div>
                          <button
                            onClick={() => setShowImplementation(!showImplementation)}
                            className="text-blue-300 text-sm font-medium flex items-center hover:text-blue-100 transition-colors duration-200"
                          >
                            {showImplementation ? "Hide" : "Show"} Implementation
                            <ChevronRight size={16} className={`ml-1 transform transition-transform ${showImplementation ? 'rotate-90' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {showImplementation && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-blue-200 text-sm mt-3 leading-relaxed"
                              >
                                {message.recommendation.implementation}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-900 bg-opacity-30 rounded-lg p-5 border border-blue-700 border-opacity-50 shadow-inner">
                    <div className="flex items-start">
                      <ArrowRight
                        size={20}
                        className="flex-shrink-0 text-blue-400 mt-1 mr-4"
                      />
                      <div>
                        <h4 className="text-blue-100 font-semibold mb-3 flex items-center">
                          Next Steps
                          <span
                            className={`ml-2 text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(
                              message.nextSteps.priority
                            )}`}
                          >
                            {message.nextSteps.priority} Priority
                          </span>
                        </h4>
                        <ul className="space-y-4 text-blue-200 text-sm">
                          <li>
                            <span className="font-medium text-blue-100">Focus:</span>{" "}
                            {message.nextSteps.focus}
                          </li>
                          <li>
                            <div>
                              <button
                                onClick={() => setShowGuidance(!showGuidance)}
                                className="text-blue-300 text-sm font-medium flex items-center hover:text-blue-100 transition-colors duration-200"
                              >
                                <span className="font-medium">Guidance</span>
                                <ChevronRight size={16} className={`ml-1 transform transition-transform ${showGuidance ? 'rotate-90' : ''}`} />
                              </button>
                              <AnimatePresence>
                                {showGuidance && (
                                  <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-3 leading-relaxed"
                                  >
                                    {message.nextSteps.guidance}
                                  </motion.p>
                                )}
                              </AnimatePresence>
                            </div>
                          </li>
                          <li>
                            <span className="font-medium text-blue-100">Progression:</span>{" "}
                            {message.nextSteps.progression}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomAlert;