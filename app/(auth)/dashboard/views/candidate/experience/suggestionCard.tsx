import React from "react";
import { motion } from "framer-motion";
import { Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WorkExperience as Experience } from "@/app/(auth)/dashboard/views/candidate/experience/panel";

interface PremiumSuggestionCardProps {
  experience: Experience;
  isActive: boolean;
  onClick: () => void;
  onCopy: (text: string) => void;
}

const SuggestionCard: React.FC<PremiumSuggestionCardProps> = ({
  experience,
  isActive,
  onClick,
  onCopy,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-md shadow-lg overflow-hidden transition-all duration-300 ${
        isActive ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="p-6" onMouseEnter={onClick}>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">
              Analysis
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {experience.comment}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">
              Recommendation
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {experience.recommendation}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">
              Suggested Change
            </h4>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-start">
                <p className="text-gray-700 italic text-sm leading-relaxed pr-8">
                  {experience.suggestedChange}
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopy(experience.suggestedChange);
                        }}
                      >
                        <Clipboard className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="left"
                      className="bg-gray-800 text-white border-0"
                    >
                      <p>Copy to clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SuggestionCard;