import React, { useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Search, Zap, Brain, UserCheck, Sparkles, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export const SmartMatchingSection: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

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
      className="py-32 bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 text-gray-900 overflow-hidden relative"
    >
      <div className="max-w-7xl mx-auto px-8 lg:px-12 relative z-10">
        <motion.h2
          variants={itemVariants}
          className="text-5xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 py-2 overflow-visible"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ComparisonColumn
            title="Traditional Approach"
            icon={Search}
            iconColor="text-gray-600"
            features={[
              { icon: Search, text: "Broad job listings requiring manual filtering" },
              { icon: Search, text: "Time-intensive search and application process" },
              { icon: Search, text: "Surface-level matching based on keywords" },
              { icon: Search, text: "Generic approach to candidate evaluation" },
              { icon: Search, text: "Information overload from numerous postings" },
            ]}
          />
          <ComparisonColumn
            title="G2X Talent Network"
            icon={Zap}
            iconColor="text-indigo-600"
            features={[
              { icon: Brain, text: "Intelligent Matching: Our advanced AI analyzes your complete professional story for precise opportunity alignment." },
              { icon: Zap, text: "Always-On Opportunity Finder: Keep your profile current, and let our AI uncover perfect-fit positions 24/7." },
              { icon: UserCheck, text: "Career Progression Focus: We identify opportunities that not only match your skills but propel your career forward." },
              { icon: Sparkles, text: "Effortless Discovery: We surface only the opportunities that truly matter, streamlining your job search." },
              { icon: Brain, text: "Holistic Candidate Understanding: Our AI considers your skills, experience, potential, and aspirations for optimal matching." },
            ]}
          />
        </div>

        <motion.div
          variants={itemVariants}
          className="mt-16 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 inline-flex items-center transition-all duration-300"
          >
            Get Started with AI-Powered Matching
            <ArrowRight className="ml-2 h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
};

const ComparisonColumn = ({
  title,
  icon: Icon,
  iconColor,
  features,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  features: { icon: React.ElementType; text: string }[];
}) => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <motion.div variants={itemVariants}>
      <Card className="h-full bg-white/80 backdrop-blur-lg border-none text-gray-800 hover:bg-white/90 transition-all duration-300 p-8 rounded-3xl shadow-lg hover:shadow-xl">
        <div className="flex items-center mb-8">
          <Icon className={`w-12 h-12 mr-4 ${iconColor}`} />
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        </div>
        <ul className="space-y-6">
          {features.map((feature, index) => (
            <motion.li
              key={index}
              className="flex items-start"
              onHoverStart={() => setHoveredFeature(index)}
              onHoverEnd={() => setHoveredFeature(null)}
            >
              <feature.icon className={`w-6 h-6 mr-3 mt-1 flex-shrink-0 ${iconColor}`} />
              <span className="text-gray-700">
                {feature.text}
              </span>
              <AnimatePresence>
                {hoveredFeature === index && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute left-4 right-4 p-4 bg-indigo-100 rounded-lg shadow-md text-sm text-indigo-800 mt-2"
                  >
                    {getFeatureDetail(index)}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </ul>
      </Card>
    </motion.div>
  );
};

const getFeatureDetail = (index: number) => {
  const details = [
    "Our AI analyzes thousands of job postings to find the best matches for you.",
    "Set your preferences once, and receive tailored job recommendations continuously.",
    "We track industry trends to suggest roles that align with your long-term career goals.",
    "Our platform curates a personalized feed of highly relevant job opportunities.",
    "By understanding your unique profile, we can match you with roles where you'll truly excel."
  ];
  return details[index] || "Learn more about this feature";
};

export default SmartMatchingSection;