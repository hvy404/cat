import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Book, Briefcase, ChevronRight } from "lucide-react";

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
  icon: React.ElementType;
  title: string;
  description: string;
  linkText: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  linkText,
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
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p className="text-sm text-gray-600 leading-relaxed mb-2">
                {description}
              </p>
              <a href="#" className="text-sm text-gray-700 hover:text-gray-900 flex items-center">
                {linkText}
                <ChevronRight className="w-4 h-4 ml-1" />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const WelcomePanel = () => {
  const features = [
    {
      icon: Mail,
      title: "Stay Connected",
      description: "Keep an eye on your inbox for personalized job recommendations and updates on your applications.",
      linkText: "Check Messages",
    },
    {
      icon: Book,
      title: "Learn and Grow",
      description: "Explore our resources to enhance your skills and make your profile stand out to potential employers.",
      linkText: "Browse Resources",
    },
    {
      icon: Briefcase,
      title: "Your Next Opportunity",
      description: "We're here to help you find the perfect job. Let's take the next step in your career together.",
      linkText: "Explore Jobs",
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
        Welcome to Your Career Growth Journey
      </h2>

      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          linkText={feature.linkText}
        />
      ))}
    </motion.div>
  );
};

export default WelcomePanel;