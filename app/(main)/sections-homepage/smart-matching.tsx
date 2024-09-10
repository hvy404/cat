import React from "react";
import { motion, useInView } from "framer-motion";
import { Search, Zap, Brain, UserCheck, Sparkles } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export const SmartMatchingSection: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className="py-32 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900 overflow-hidden relative"
    >
      <div className="max-w-7xl mx-auto px-8 lg:px-12 relative z-10">
        <motion.h2
          variants={itemVariants}
          className="text-5xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 py-2 overflow-visible"
        >
          Find Your Perfect Job Match
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="text-xl text-gray-700 text-center mb-16 max-w-3xl mx-auto"
        >
          Let AI do the heavy lifting. Discover opportunities that align with
          your skills, experience, and career aspirations—all without the
          endless scrolling.
        </motion.p>

        <div className="flex flex-col lg:flex-row gap-8">
          <ComparisonColumn
            title="Traditional Approach"
            icon={Search}
            color="bg-gray-100"
            textColor="text-gray-800"
            features={[
              "Broad job listings requiring manual filtering",
              "Time-intensive search and application process",
              "Surface-level matching based on keywords",
              "Generic approach to candidate evaluation",
              "Information overload from numerous postings",
            ]}
          />
          <ComparisonColumn
            title="Our AI-Powered Platform"
            icon={Zap}
            color="bg-indigo-600"
            textColor="text-white"
            features={[
              "Intelligent Matching: Our advanced AI analyzes your complete professional story for precise opportunity alignment.",
              "Always-On Opportunity Finder: Keep your profile current, and let our AI uncover perfect-fit positions 24/7.",
              "Career Progression Focus: We identify opportunities that not only match your skills but propel your career forward.",
              "Effortless Discovery: We surface only the opportunities that truly matter, streamlining your job search.",
              "Holistic Candidate Understanding: Our AI considers your skills, experience, potential, and aspirations for optimal matching.",
            ]}
          />
        </div>
      </div>
    </motion.section>
  );
};
const ComparisonColumn = ({
  title,
  icon: Icon,
  color,
  textColor,
  features,
}: {
  title: string;
  icon: React.ElementType;
  color: string;
  textColor: string;
  features: string[];
}) => (
  <motion.div
    variants={itemVariants}
    className={`flex-1 rounded-xl p-8 transition-all duration-300 ${color} ${textColor}`}
  >
    <div className="flex items-center mb-6">
      <Icon className="w-12 h-12 mr-4" />
      <h3 className="text-2xl font-bold">{title}</h3>
    </div>
    <ul className="space-y-4">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          {React.createElement(
            color === "bg-indigo-600"
              ? [Brain, Zap, UserCheck, Sparkles, Brain][index % 5]
              : Search,
            { className: "w-6 h-6 mr-3 mt-1 flex-shrink-0" }
          )}
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </motion.div>
);
