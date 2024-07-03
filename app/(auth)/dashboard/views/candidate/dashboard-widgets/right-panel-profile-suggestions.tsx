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

interface ProfileEnhancementsPayload {
  title: string;
  type: string;
  message: string;
  priority: "high" | "medium" | "low";
}

export default function RightPanelProfileSuggestionDetails({
  title,
  type,
  message,
  priority,
}: ProfileEnhancementsPayload) {
  const { setSelectedMenuItem, setCandidateDashboard } = useStore();

  const clearWidget = () => {
    setCandidateDashboard({
      widget: "",
      widgetPayload: { type: null, payload: null },
    });
  };

  const handleEnhanceProfile = () => {
    clearWidget();
    setSelectedMenuItem(`talent-certifications`);
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

  const getTypeSpecificContent = (type: string) => {
    switch (type) {
      case "location":
        return {
          why: "Your location information helps employers find local talent and tailor job opportunities to your area.",
          tips: [
            "Ensure your city and state are accurate and up-to-date.",
            "Consider adding your zip code for more precise matching.",
            "If you're open to relocation, mention it in your profile.",
          ],
        };
      case "contact":
        return {
          why: "Complete contact information ensures employers can reach you easily about potential opportunities.",
          tips: [
            "Provide a professional email address you check regularly.",
            "Include a phone number where you can be reached during business hours.",
            "Consider adding links to professional social media profiles.",
          ],
        };
      case "job":
        return {
          why: "Detailed job information showcases your experience and helps match you with relevant positions.",
          tips: [
            "Use a clear, industry-standard job title.",
            "Include your current (or most recent) company name.",
            "Briefly describe your role and key responsibilities.",
          ],
        };
      case "security":
        return {
          why: "Security clearance information can open up opportunities in government and defense-related positions.",
          tips: [
            "Specify your current clearance level accurately.",
            "Include the date of your last investigation if applicable.",
            "Mention any special certifications related to security clearance.",
          ],
        };
      case "status":
        return {
          why: "Your job search status helps us tailor our recommendations and lets employers know your availability.",
          tips: [
            "Update your status regularly to reflect your current situation.",
            "If you're open to opportunities but not actively looking, mention it.",
            "Specify any preferences for full-time, part-time, or contract work.",
          ],
        };
      default:
        return {
          why: "Keeping your profile complete and up-to-date improves your chances of finding the right opportunities.",
          tips: [
            "Regularly review and update your profile information.",
            "Provide as much relevant detail as possible in each section.",
            "Ensure all information is accurate and current.",
          ],
        };
    }
  };

  const typeSpecificContent = getTypeSpecificContent(type);

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
              <p className="text-sm text-gray-300">{typeSpecificContent.why}</p>
            </section>

            <section className="bg-gray-700 p-4 rounded-lg shadow-inner text-gray-100">
              <h3 className="text-md font-semibold mb-2">Power Moves</h3>
              <ul className="space-y-2 text-sm">
                {typeSpecificContent.tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <ArrowRight className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>

            <motion.button
              className="w-full bg-gray-600 hover:bg-gray-500 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1"
              onClick={handleEnhanceProfile}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Enhance Your {type.charAt(0).toUpperCase() + type.slice(1)} Information
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}