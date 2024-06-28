import React, { useState } from "react";
import { motion } from "framer-motion";
import useStore from "@/app/state/useStore";
import { fetchAndAnalyzeTalent } from "@/lib/candidate/experience/overview";
import { toast } from "sonner";
import {
  experienceSuggestionCacheStore,
  getExperienceSuggestionCache,
} from "@/lib/candidate/experience/suggestion-cache";
import SuggestionCard from "@/app/(auth)/dashboard/views/candidate/experience/suggestionCard";

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

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

const retryFetchAndAnalyze = async (
  candidate: string,
  retries = 0
): Promise<string | null> => {
  try {
    const result = await fetchAndAnalyzeTalent(candidate);
    if (result) {
      return result;
    }
  } catch (error) {
    console.error(`Attempt ${retries + 1} failed:`, error);
  }

  if (retries < MAX_RETRIES) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    return retryFetchAndAnalyze(candidate, retries + 1);
  }

  return null;
};

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
      const cachedResult = await getExperienceSuggestionCache(
        props.workExperienceAnalysisSession,
        candidate
      );

      if (cachedResult) {
        setAnalysis(JSON.parse(cachedResult) as AnalysisData);
      } else {
        // If not cached, fetch and analyze with retry logic
        const result = await retryFetchAndAnalyze(candidate);
        if (result) {
          // Cache the result
          await experienceSuggestionCacheStore(
            props.workExperienceAnalysisSession,
            candidate,
            result
          );
          setAnalysis(JSON.parse(result) as AnalysisData);
        } else {
          setError(
            "We are experiencing heavy traffic. Please try again in a few moments."
          );
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
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 mt-4 text-sm text-center max-w-md"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        )}

        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="w-full space-y-6 pt-4 sm:pt-6 md:pt-8"
          >
            <div className="space-y-4">
              <p className="text-xs font-normal text-gray-400">
                AI can make mistakes. Please double-check suggestions before you
                apply them.
              </p>
              {analysis.workExperiences.map((exp: WorkExperience) => (
                <SuggestionCard
                  key={exp.id}
                  experience={exp}
                  isActive={activeExperience === exp.id}
                  onClick={() => handleExperienceClick(exp)}
                  onCopy={handleCopyToClipboard}
                />
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
