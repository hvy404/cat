import React from "react";
import { motion } from "framer-motion";
import { User, Bell, HelpCircle, LucideIcon } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 0 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

interface ExplanationCardProps {
  icon: LucideIcon;
  title: string;
  content: string;
}

const ExplanationCard: React.FC<ExplanationCardProps> = ({
  icon: Icon,
  title,
  content,
}) => (
  <motion.div
    className="w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
    variants={itemVariants}
  >
    <div className="p-6 space-y-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 rounded-full">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        <h3 className="text-md font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
    </div>
  </motion.div>
);

const ProfileRightPanel = () => {
  return (
    <motion.div
      className="flex flex-col items-start h-full justify-start p-6 md:p-8 lg:p-12 space-y-6 bg-gray-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-lg font-bold text-gray-800">Profile Information</h2>

      <ExplanationCard
        icon={User}
        title="Personal Information"
        content="Keep your personal details up to date. This information helps us tailor your experience and improves your visibility to potential employers."
      />

      <ExplanationCard
        icon={Bell}
        title="Notification Preferences"
        content="Manage your email alerts for AI candidate matches and new job applicants. Stay informed without being overwhelmed."
      />

      <ExplanationCard
        icon={HelpCircle}
        title="Profile Completion Tips"
        content="A complete profile increases your chances of finding the right candidates. Make sure to fill out all sections and keep your information current."
      />
    </motion.div>
  );
};

export default ProfileRightPanel;
