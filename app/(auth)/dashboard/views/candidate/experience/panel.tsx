import React, { useState } from "react";
import { motion } from "framer-motion";
import useStore from "@/app/state/useStore";
import { fetchAndAnalyzeTalent } from "@/lib/candidate/experience/overview";

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
}

export default function RightPanel(props: RightPanelProps) {
  const candidate = useStore((state) => state.user?.uuid);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeExperience, setActiveExperience] = useState<string | null>(null);

  const handleAnalysis = async () => {
    if (!candidate) {
      setError("No candidate selected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchAndAnalyzeTalent(candidate);
      if (result) {
        setAnalysis(JSON.parse(result) as AnalysisData);
      } else {
        setError("Unable to generate analysis for this candidate.");
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

  return (
    <div className="min-h-[90vh] rounded-lg bg-gray-100 p-4 overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative h-full w-full"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAnalysis}
          disabled={isLoading || !candidate}
          className="px-4 py-2 bg-gray-700 text-gray-100 rounded-md hover:bg-gray-600 disabled:bg-gray-400 transition-colors duration-200 text-sm font-medium"
        >
          {isLoading ? "Analyzing..." : "Get AI Analysis"}
        </motion.button>

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
            className="mt-6 space-y-6"
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
                      <p className="text-sm text-gray-600 italic">
                        {exp.suggestedChange}
                      </p>
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
