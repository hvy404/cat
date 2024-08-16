import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Zap, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const StepCard: React.FC<{ icon: React.ElementType; title: string; description: string }> = ({ icon: Icon, title, description }) => (
  <Card className="w-full bg-white shadow-sm hover:shadow-md transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-blue-50 rounded-full">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function RefinedJDBuilderRightPanel() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
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

  return (
    <motion.div
      className="flex flex-col h-full justify-center p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate={isLoaded ? "visible" : "hidden"}
    >
      <motion.div variants={itemVariants} className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Job Description Generator
        </h2>
        <p className="text-sm text-gray-700">
          Create a detailed job description from your SOW or PWS document.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <StepCard
          icon={Upload}
          title="Upload Document"
          description="Start by uploading your SOW or PWS file (PDF or Word)."
        />
        <StepCard
          icon={FileText}
          title="AI Analysis"
          description="Our system extracts required personnel from your document."
        />
        <StepCard
          icon={Zap}
          title="Generate Draft"
          description="We create an initial job description based on the analysis."
        />
        <StepCard
          icon={CheckCircle}
          title="Review and Edit"
          description="Review, modify, and finalize your job posting."
        />
      </motion.div>
    </motion.div>
  );
}