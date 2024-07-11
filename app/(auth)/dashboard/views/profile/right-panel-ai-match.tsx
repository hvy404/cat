import React from "react";
import { motion } from "framer-motion";
import { Mail, Bell, Zap } from "lucide-react";

export function AIMatchExplanationPanel() {
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

  const ExplanationCard = ({
    icon: Icon,
    title,
    content,
  }: {
    icon: React.ElementType;
    title: string;
    content: string;
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

  return (
    <motion.div
      className="flex flex-col items-start h-full justify-start p-6 md:p-8 lg:p-12 space-y-6 bg-gray-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-lg font-bold text-gray-800">New AI Talent Matches</h2>

      <ExplanationCard
        icon={Mail}
        title="Stay Informed"
        content="Receive email alerts when our AI finds potential matches for your job openings. Never miss out on qualified candidates, even when you're away from the dashboard."
      />

      <ExplanationCard
        icon={Bell}
        title="Flexible Control"
        content="Opt out if you prefer to check matches only when you log in. Keep your inbox clutter-free and review potential candidates at your own pace on the dashboard."
      />

      <ExplanationCard
        icon={Zap}
        title="Act Quickly"
        content="Get timely notifications about new matches, allowing you to reach out to promising candidates before your competitors. Streamline your hiring process and secure top talent faster."
      />
    </motion.div>
  );
}
