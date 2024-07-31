import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Users, Zap, ChevronRight, LucideIcon } from "lucide-react";

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
      variants={itemVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <Icon className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-md font-semibold text-gray-800">{title}</h3>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
        <AnimatePresence>
          {isHovered && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-gray-600 leading-relaxed"
            >
              {description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const EmployerDashboardMainSidePanel = () => {
  const features = [
    {
      icon: Briefcase,
      title: "Smart Job Posting",
      description:
        "AI-optimized job descriptions to attract top talent. Our system analyzes market trends and candidate preferences to help you craft compelling job posts.",
    },
    {
      icon: Users,
      title: "Candidate Matching",
      description:
        "Precision AI matching for your ideal candidates. Our advanced algorithms consider skills, experience, and cultural fit to present you with the most suitable applicants.",
    },
    {
      icon: Zap,
      title: "Accelerated Analysis",
      description:
        "Streamlined processes to reduce time-to-hire. Automate repetitive tasks and focus on what matters most - finding the perfect fit for your team.",
    },
  ];

  return (
    <motion.div
      className="flex flex-col items-start h-full justify-start md:p-6 space-y-6 bg-gray-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-lg font-bold text-gray-800">
        Welcome to Your AI-Powered Recruiting Hub
      </h2>

      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </motion.div>
  );
};

export default EmployerDashboardMainSidePanel;
