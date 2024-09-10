"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Zap,
  FileText,
  FileSearch,
  ChevronDown,
} from "lucide-react";
import EmployerFeaturesSection from "@/app/(main)/hire/sections/employer-feature";
import ContinuousTalentPipelineSection from "@/app/(main)/hire/sections/pipeline";

const EmployerMain = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Zap className="h-8 w-8 text-blue-600" />,
      title: "AI-Powered Matching",
      description:
        "Our advanced algorithm finds the perfect candidates for your roles, saving you time and improving hiring quality.",
    },
    {
      icon: <FileText className="h-8 w-8 text-blue-600" />,
      title: "Intelligent Job Descriptions",
      description:
        "Create compelling job postings with AI assistance, ensuring you attract the right talent for your organization.",
    },
    {
      icon: <FileSearch className="h-8 w-8 text-blue-600" />,
      title: "SOW Analysis",
      description:
        "Our AI parses and analyzes Statements of Work, helping you quickly identify key requirements and find the best talent for complex projects.",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 min-h-screen text-white overflow-hidden">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-7xl py-20 sm:py-32 lg:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.2]">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  Revolutionize
                </span>
                <br />
                Your Hiring Process
              </h1>

              <p className="text-xl sm:text-2xl leading-8 text-gray-300 mb-12 max-w-2xl mx-auto lg:mx-0">
                Harness the power of AI to streamline your recruitment, find
                perfect candidates, and make data-driven hiring decisions.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <a
                  href="#demo"
                  className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center transition-all duration-300"
                >
                  Request a Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </motion.div>
            </motion.div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8"
                  >
                    <div className="flex items-center mb-4">
                      {features[activeFeature].icon}
                      <h3 className="text-2xl font-bold ml-4">
                        {features[activeFeature].title}
                      </h3>
                    </div>
                    <p className="text-gray-300 text-lg">
                      {features[activeFeature].description}
                    </p>
                  </motion.div>
                </AnimatePresence>
                <div className="flex justify-center items-center space-x-2 mb-8">
                  {features.map((_, index) => (
                    <motion.button
                      key={index}
                      className="relative"
                      onClick={() => setActiveFeature(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.div
                        className={`w-12 h-1 rounded-full bg-gray-400`}
                        initial={false}
                        animate={{
                          backgroundColor:
                            index === activeFeature ? "#3B82F6" : "#9CA3AF",
                        }}
                        transition={{ duration: 0.3 }}
                      />
                      {index === activeFeature && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full"
                          layoutId="activeFeature"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
              <motion.div
                className="absolute -bottom-12 left-1/2 transform -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <ChevronDown className="h-8 w-8 text-blue-400" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      <EmployerFeaturesSection />
      <ContinuousTalentPipelineSection />
    </div>
  );
};

export default EmployerMain;
