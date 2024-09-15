"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  ArrowRight,
  Zap,
  FileText,
  FileSearch,
  ChevronDown,
  Globe,
  Users,
} from "lucide-react";
import EmployerFeaturesSection from "@/app/(main)/hire/sections/employer-feature";
import ContinuousTalentPipelineSection from "@/app/(main)/hire/sections/pipeline";
import FinalCallToAction from "@/app/(main)/hire/sections/footer-cta";
import { Card } from "@/components/ui/card";

const EmployerMain = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.15]"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 60, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.15]"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [0, -60, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-8"
          >
            {/* Left Column */}
            <motion.div
              variants={itemVariants}
              className="text-center lg:text-left"
            >
              <h1 className="text-3xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.2] text-gray-900">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Revolutionize
                </span>
                <br />
                Your Hiring Process
              </h1>

              <p className="text-xl sm:text-2xl leading-8 text-gray-700 mb-12 max-w-2xl mx-auto lg:mx-0">
                Streamline your recruitment process, identify ideal candidates,
                and make evidence-based hiring decisions with advanced matching
                technology.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <a
                  onClick={() => {
                    const featuresSection = document.getElementById("features");
                    if (featuresSection) {
                      featuresSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center transition-all duration-300"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </motion.div>
            </motion.div>

            {/* Right Column */}
            <motion.div variants={itemVariants} className="relative">
              <Card className="bg-white/80 backdrop-blur-lg border-none text-gray-800 hover:bg-white/90 transition-all duration-300 p-10 rounded-3xl shadow-2xl">
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
                      <h3 className="text-2xl font-bold ml-4 text-gray-900">
                        {features[activeFeature].title}
                      </h3>
                    </div>
                    <p className="text-gray-700 text-lg">
                      {features[activeFeature].description}
                    </p>
                  </motion.div>
                </AnimatePresence>
                <div className="flex justify-center items-center space-x-3 mb-8">
                  {features.map((_, index) => (
                    <motion.button
                      key={index}
                      className="relative"
                      onClick={() => setActiveFeature(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.div
                        className={`w-12 h-2 rounded-full bg-gray-300`}
                        initial={false}
                        animate={{
                          backgroundColor:
                            index === activeFeature ? "#3B82F6" : "#D1D5DB",
                        }}
                        transition={{ duration: 0.3 }}
                      />
                      {index === activeFeature && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-2 bg-blue-600 rounded-full"
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
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    {
                      icon: (
                        <Globe className="h-8 w-8 mb-2 mx-auto text-blue-600" />
                      ),
                      label: "Reach",
                    },
                    {
                      icon: (
                        <Users className="h-8 w-8 mb-2 mx-auto text-purple-600" />
                      ),
                      label: "Vetted",
                    },
                    {
                      icon: (
                        <Zap className="h-8 w-8 mb-2 mx-auto text-yellow-600" />
                      ),
                      label: "AI-Powered",
                    },
                  ].map((item, index) => (
                    <div key={index} className="p-4 bg-gray-100 rounded-xl">
                      {item.icon}
                      <p className="text-sm font-medium text-gray-800">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
              <motion.div
                className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 cursor-pointer"
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                onClick={() => {
                  const featuresSection = document.getElementById("features");
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                <ChevronDown className="h-8 w-8 text-blue-600" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <EmployerFeaturesSection />
      <ContinuousTalentPipelineSection />
      <FinalCallToAction />
    </>
  );
};

export default EmployerMain;
