import React from "react";
import { motion, useInView } from "framer-motion";
import { Upload, Edit, Search, Briefcase } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Resume",
    description:
      "Start by uploading your existing resume or create a new one from scratch.",
  },
  {
    icon: Edit,
    title: "AI-Powered Optimization",
    description:
      "Our AI analyzes and enhances your resume, tailoring it to your target jobs.",
  },
  {
    icon: Search,
    title: "Employer Matching",
    description:
      "We surface your resume to employers hiring for positions that are your exact fit.",
  },
  {
    icon: Briefcase,
    title: "Apply with Confidence",
    description: "Submit your optimized applications and track your progress.",
  },
];

export const HowItWorks: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-24 bg-gradient-to-r from-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold text-gray-900 text-center mb-16"
        >
          How It Works
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 text-center"
            >
              <div className="flex justify-center mb-4">
                <step.icon className="w-12 h-12 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
