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
    <section ref={ref} className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center mb-16 text-gray-900"
        >
          How It Works
        </motion.h2>
        <div className="relative">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start space-y-12 md:space-y-0 md:space-x-4">
            {steps.map((step, index) => (
              <StepCard
                key={index}
                {...step}
                index={index}
                isInView={isInView}
                totalSteps={steps.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const StepCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
  isInView: boolean;
  totalSteps: number;
}> = ({ icon: Icon, title, description, index, isInView, totalSteps }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    className={`w-full md:w-1/${totalSteps} flex flex-col items-center`}
  >
    <motion.div
      className="w-20 h-20 mb-6 bg-white rounded-full flex items-center justify-center shadow-md"
      whileHover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
    >
      <Icon className="w-10 h-10 text-indigo-600" />
    </motion.div>
    <div className="text-center max-w-xs">
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  </motion.div>
);
export default HowItWorks;
