import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  AlertTriangle,
  CheckCircle,
  Zap,
} from "lucide-react";
import useStore from "@/app/state/useStore";

interface RightPanelResumeSuggestionDetailsProps {
  title: string;
  type: string;
  message: string;
  priority: "high" | "medium" | "low";
}

export default function RightPanelResumeSuggestionDetails({
  title,
  type,
  message,
  priority,
}: RightPanelResumeSuggestionDetailsProps) {
  const { setSelectedMenuItem, setCandidateDashboard } = useStore();

  // clear setCandidateDashboard to default state
  const clearWidget = () => {
    setCandidateDashboard({
      widget: "",
      widgetPayload: { type: null, payload: null },
    });
  };

  const handleClickToAddCertification = () => {
    clearWidget();
    setSelectedMenuItem("talent-certifications");
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="w-5 h-5" />;
      case "medium":
        return <Award className="w-5 h-5" />;
      case "low":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-gray-200";
      case "medium":
        return "bg-gray-100";
      case "low":
        return "bg-gray-50";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="mb-4 p-4">
      <motion.div
        className={`${getBackgroundColor(priority)} rounded-lg overflow-hidden`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getPriorityIcon(priority)}
            <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          </div>
        </div>

        <div className="px-4 pb-4">
          <p className="text-sm text-gray-600 mb-4">{message}</p>

          <div className="space-y-4">
            <section className="bg-gray-800 p-4 rounded-lg shadow-inner text-gray-100">
              <h3 className="text-sm font-semibold mb-2 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Why This Matters
              </h3>
              <p className="text-sm text-gray-300">
                {type === "experience" &&
                  "Your work experience showcases your professional journey and the value you've brought to previous roles."}
                {type === "education" &&
                  "Education forms the foundation of your knowledge and demonstrates your ability to learn and grow."}
                {type === "skills" &&
                  "In today's job market, your skills are what make you unique and valuable to potential employers."}
                {type === "certifications" &&
                  "Certifications prove your expertise and commitment to your field, potentially giving you an edge over other candidates."}
              </p>
            </section>

            <section className="bg-gray-700 p-4 rounded-lg shadow-inner text-gray-100">
              <h3 className="text-md font-semibold mb-2">Power Moves</h3>
              <ul className="space-y-2 text-sm">
                {type === "experience" && (
                  <>
                    <li className="flex items-start">
                      <ArrowRight className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                      <span>
                        Use the STAR method for compelling descriptions.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                      <span>
                        Incorporate industry keywords for ATS optimization.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                      <span>Quantify achievements with specific metrics.</span>
                    </li>
                  </>
                )}
                {type === "education" && (
                  <>
                    <li className="flex items-start">
                      <ArrowRight className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                      <span>
                        Highlight relevant coursework aligned with your target
                        role.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                      <span>
                        Showcase academic projects demonstrating practical
                        skills.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                      <span>Include honors or awards to stand out.</span>
                    </li>
                  </>
                )}
                {type === "skills" && (
                  <>
                    <li className="flex items-start">
                      <ArrowRight className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                      <span>
                        Create a 'Skills Matrix' to visualize proficiency
                        levels.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                      <span>
                        Tailor skills to match specific job requirements.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                      <span>
                        Balance hard and soft skills for a well-rounded profile.
                      </span>
                    </li>
                  </>
                )}
                {type === "certifications" && (
                  <>
                    <li className="flex items-start">
                      <ArrowRight className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                      <span>
                        Prioritize industry-recognized certifications.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                      <span>
                        Include expiration dates to show current credentials.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                      <span>
                        Link to digital badges or online verification.
                      </span>
                    </li>
                  </>
                )}
              </ul>
            </section>

            <motion.button
              className="w-full bg-gray-600 hover:bg-gray-500 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1"
              onClick={handleClickToAddCertification}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Enhance Your {type.charAt(0).toUpperCase() + type.slice(1)}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
