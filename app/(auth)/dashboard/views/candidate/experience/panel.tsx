import React, { useState } from "react";
import { motion } from "framer-motion";
import useStore from "@/app/state/useStore";
import { fetchAndAnalyzeTalent } from "@/lib/candidate/experience/overview";
import { toast } from "sonner";
import { Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { experienceSuggestionCacheStore, getExperienceSuggestionCache } from "@/lib/candidate/experience/suggestion-cache";

export interface WorkExperience {
  id: string;
  comment: string;
  recommendation: string;
  suggestedChange: string;
}

interface AnalysisData {
  workExperiences: WorkExperience[];
  overallRecommendations: string[];
}

interface RightPanelProps {
  setSelectedSuggestion: (suggestion: WorkExperience | undefined) => void;
  workExperienceAnalysisSession: string;
}

export default function RightPanel(props: RightPanelProps) {
  const candidate = useStore((state) => state.user?.uuid);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeExperience, setActiveExperience] = useState<string | null>(null);

  const handleAnalysis = async () => {
    if (!candidate || !props.workExperienceAnalysisSession) {
      setError("No candidate selected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try to get the cached result first
      const cachedResult = await getExperienceSuggestionCache(props.workExperienceAnalysisSession, candidate);
      
      if (cachedResult) {
        setAnalysis(JSON.parse(cachedResult) as AnalysisData);
      } else {
        // If not cached, fetch and analyze
        const result = await fetchAndAnalyzeTalent(candidate);
        if (result) {
          // Cache the result
          await experienceSuggestionCacheStore(props.workExperienceAnalysisSession, candidate, result);
          setAnalysis(JSON.parse(result) as AnalysisData);
        } else {
          setError("Unable to generate analysis for this candidate.");
        }
      }
    } catch (err) {
      setError("An error occurred while fetching the analysis.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExperienceClick = (exp: WorkExperience) => {
    setActiveExperience(exp.id);
    props.setSelectedSuggestion(exp);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy to clipboard");
      });
  };

  return (
    <div className="min-h-[90vh] rounded-lg bg-gray-100 p-4 overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full flex flex-col items-center justify-center min-h-full"
      >
        {!analysis && (
          <motion.div className="flex flex-col items-center justify-center gap-6 absolute inset-0">
            <motion.h3 className="font-merriweather text-gray-600 text-3xl">
              Enhance your professional story
            </motion.h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalysis}
              disabled={isLoading || !candidate}
              className="px-4 py-2 bg-gray-700 text-gray-100 rounded-md hover:bg-gray-600 disabled:bg-gray-400 transition-colors duration-200 text-sm font-medium"
            >
              {isLoading ? "Analyzing..." : "Get Analysis 🧑‍💻"}
            </motion.button>
          </motion.div>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 mt-3 text-sm"
          >
            {error}
          </motion.p>
        )}

        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="w-full space-y-6 pt-4 sm:pt-6 md:pt-8"
          >
            <div className="space-y-4">
              <h3 className="text-base font-medium text-gray-700">
                Work Experience Insights
              </h3>
              {analysis.workExperiences.map((exp: WorkExperience) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                  transition={{ duration: 0.2 }}
                  className={`bg-white p-4 rounded-md shadow-sm border cursor-pointer hover:bg-gray-50 ${
                    activeExperience === exp.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => handleExperienceClick(exp)}
                >
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                        Analysis:
                      </h4>
                      <p className="text-sm text-gray-600">{exp.comment}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                        Recommendation:
                      </h4>
                      <p className="text-sm text-gray-600">
                        {exp.recommendation}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                        Suggested Change:
                      </h4>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 italic">
                          {exp.suggestedChange}
                        </p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyToClipboard(exp.suggestedChange);
                                }}
                              >
                                <Clipboard className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="left"
                              className="bg-black border-0 text-white"
                            >
                              <p>Add to clipboard</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-medium text-gray-700">
                Overall Recommendations
              </h3>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.2 }}
                className="bg-white p-4 rounded-md shadow-sm border border-gray-200 hover:bg-gray-50"
              >
                <ul className="space-y-2">
                  {analysis.overallRecommendations.map(
                    (rec: string, index: number) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="text-sm text-gray-600 flex items-start"
                      >
                        <span className="text-gray-400 mr-2">•</span>
                        <span>{rec}</span>
                      </motion.li>
                    )
                  )}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}