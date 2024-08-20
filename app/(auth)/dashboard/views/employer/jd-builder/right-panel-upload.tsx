import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Zap,
  CheckCircle,
  Compass,
  InfoIcon,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

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

const StepCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <motion.div
    className="w-full bg-white bg-opacity-50 rounded-lg p-4 transition-all duration-300 hover:bg-opacity-70 hover:shadow-md"
    variants={itemVariants}
  >
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-gray-200 rounded-full flex-shrink-0">
        <Icon className="w-5 h-5 text-gray-700" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
);

const steps = [
  {
    icon: Upload,
    title: "Upload Document",
    description: "Start by uploading your SOW or PWS file (PDF or Word).",
  },
  {
    icon: FileText,
    title: "AI Analysis",
    description: "Our system extracts required personnel from your document.",
  },
  {
    icon: Zap,
    title: "Generate Draft",
    description: "We create an initial job description based on the analysis.",
  },
  {
    icon: CheckCircle,
    title: "Review and Edit",
    description: "Review, modify, and finalize your job posting.",
  },
];

export default function RefinedJDBuilderRightPanel() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <motion.div
      className="flex flex-col items-start h-full justify-start md:p-6 space-y-6 bg-gray-50"
      variants={containerVariants}
      initial="hidden"
      animate={isLoaded ? "visible" : "hidden"}
    >
      <Card className="w-full bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-6">
          <CardTitle className="text-xl font-bold flex items-center">
            <Compass className="h-6 w-6 mr-3" />
            Job Description Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Create a detailed job description from your SOW or PWS document in
            just a few simple steps.
          </p>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <StepCard key={index} {...step} />
            ))}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-100 p-4">
          <p className="text-xs text-gray-600 font-medium flex items-center">
            <InfoIcon className="h-4 w-4 mr-2" />
            AI can make mistakes. Please double-check suggestions before you apply them.
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
