import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Upload, RefreshCw, UserCheck, Bell, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const ContinuousTalentPipelineSection = () => {
  const steps = [
    {
      icon: <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />,
      title: "Upload Your Job",
      description:
        "Simply post your job requirements and let our AI-powered system take over.",
    },
    {
      icon: <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />,
      title: "Continuous Matching",
      description:
        "Our platform works 24/7 to evaluate and match candidates to your job.",
    },
    {
      icon: <UserCheck className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />,
      title: "Quality Assurance",
      description:
        "AI-driven algorithms ensure only the best matches are surfaced.",
    },
    {
      icon: <Bell className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600" />,
      title: "Instant Notifications",
      description:
        "Get alerted when high-quality candidates are identified for your role.",
    },
  ];

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.2 });

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-5">
            Your Always-On Talent Scout
          </h2>
          <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto">
            Experience the power of a continuous talent pipeline, working
            tirelessly to bring you the perfect candidates.
          </p>
        </motion.div>

        <div className="relative" ref={containerRef}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full hidden sm:block"></div>
          </div>

          <div className="relative z-10 space-y-12 sm:space-y-28">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
                }
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className={`flex flex-col sm:flex-row items-center ${
                  index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                }`}
              >
                <div
                  className={`w-full sm:w-1/2 ${
                    index % 2 === 0 ? "sm:pr-14" : "sm:pl-14"
                  } mb-6 sm:mb-0`}
                >
                  <Card className="p-5 sm:p-7 bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-2xl border-none">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-gray-100 rounded-full mr-3">
                        {step.icon}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      {step.description}
                    </p>
                  </Card>
                </div>
                <div className="relative flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 my-4 sm:my-0">
                  <motion.div
                    className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 absolute opacity-20"
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
                  ></motion.div>
                  <motion.div
                    className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center relative z-10 shadow-lg"
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                  >
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">
                      {index + 1}
                    </span>
                  </motion.div>
                </div>
                <div className="w-full sm:w-1/2 hidden sm:block"></div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 sm:mt-28 text-center"
        >
          <p className="text-xl sm:text-2xl text-gray-900 font-semibold mb-6 sm:mb-8 max-w-3xl mx-auto">
            Set it and forget it. Let our AI-powered system build your
            continuous talent pipeline.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center transition-all duration-300"
          >
            Start Your Talent Pipeline
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default ContinuousTalentPipelineSection;
