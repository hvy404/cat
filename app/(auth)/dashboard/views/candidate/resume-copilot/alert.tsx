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
        return <Plus {...iconProps} className={`${iconProps.className} text-emerald-500`} />;
      case "remove":
        return <Minus {...iconProps} className={`${iconProps.className} text-red-500`} />;
      case "modify":
        return <Edit {...iconProps} className={`${iconProps.className} text-slate-400`} />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: "High" | "Medium" | "Low") => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-orange-100 text-orange-800";
      case "Low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
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
            className="bg-white text-slate-700 text-sm font-medium py-2 px-4 rounded-md cursor-pointer shadow-sm hover:bg-slate-50 transition-all duration-300 flex items-center space-x-2 border border-slate-200"
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
            <Alert className="bg-white rounded-lg p-5 border-none">
              <div className="flex justify-between items-center mb-4">
                <AlertTitle className="text-slate-800 font-bold text-lg">
                  AI Recommendation
                </AlertTitle>
                <button
                  className="text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors duration-200 flex items-center space-x-1"
                  onClick={onToggleMinimize}
                >
                  <span>Minimize</span>
                  <ChevronUp size={16} />
                </button>
              </div>
              <AlertDescription>
                <div className="space-y-5">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-start">
                      <div className="mt-1 mr-4">
                        {getActionIcon(message.recommendation.action)}
                      </div>
                      <div>
                        <h4 className="text-slate-700 font-semibold mb-2">Recommendation</h4>
                        <p className="text-slate-600 text-sm mb-2">
                          {showFullRecommendation
                            ? message.recommendation.rationale
                            : truncate(message.recommendation.rationale, 150)}
                        </p>
                        {message.recommendation.rationale.length > 150 && (
                          <button
                            onClick={() => setShowFullRecommendation(!showFullRecommendation)}
                            className="text-blue-600 text-sm font-medium flex items-center hover:underline mb-3"
                          >
                            {showFullRecommendation ? "Show Less" : "Show More"}
                            <ChevronRight size={16} className={`ml-1 transform transition-transform ${showFullRecommendation ? 'rotate-90' : ''}`} />
                          </button>
                        )}
                        <div>
                          <button
                            onClick={() => setShowImplementation(!showImplementation)}
                            className="text-blue-600 text-sm font-medium flex items-center hover:underline"
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
                                className="text-slate-600 text-sm mt-2"
                              >
                                {message.recommendation.implementation}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-start">
                      <ArrowRight
                        size={20}
                        className="flex-shrink-0 text-slate-400 mt-1 mr-4"
                      />
                      <div>
                        <h4 className="text-slate-700 font-semibold mb-2 flex items-center">
                          Next Steps
                          <span
                            className={`ml-2 text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(
                              message.nextSteps.priority
                            )}`}
                          >
                            {message.nextSteps.priority} Priority
                          </span>
                        </h4>
                        <ul className="space-y-3 text-slate-600 text-sm">
                          <li>
                            <span className="font-medium">Focus:</span>{" "}
                            {message.nextSteps.focus}
                          </li>
                          <li>
                            <div>
                              <button
                                onClick={() => setShowGuidance(!showGuidance)}
                                className="text-blue-600 text-sm font-medium flex items-center hover:underline"
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
                                    className="mt-2"
                                  >
                                    {message.nextSteps.guidance}
                                  </motion.p>
                                )}
                              </AnimatePresence>
                            </div>
                          </li>
                          <li>
                            <span className="font-medium">Progression:</span>{" "}
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