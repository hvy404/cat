"use client";
import React from "react";
import { motion } from "framer-motion";
import { Upload, Search, Handshake, Star, ChevronRight } from "lucide-react";

const HowItWorksPage = () => {
  const steps = [
    {
      icon: Upload,
      title: "Join Our Ecosystem",
      candidateAction: "Create your professional profile",
      employerAction: "Post your job opportunities",
      description:
        "Our platform brings together talented individuals and forward-thinking companies, creating a vibrant community of opportunity.",
    },
    {
      icon: Search,
      title: "Smart Matching",
      candidateAction: "Discover tailored job recommendations",
      employerAction: "Find ideal candidates effortlessly",
      description:
        "Our AI-powered matching system ensures that the right talent connects with the right opportunities, saving time and increasing satisfaction for both parties.",
    },
    {
      icon: Handshake,
      title: "Meaningful Connections",
      candidateAction: "Apply with confidence",
      employerAction: "Engage with top matches",
      description:
        "We facilitate seamless interactions, allowing candidates and employers to connect in a more meaningful and efficient way than traditional job boards.",
    },
    {
      icon: Star,
      title: "Mutual Growth",
      candidateAction: "Advance your career",
      employerAction: "Build your dream team",
      description:
        "By fostering the right connections, we help professionals grow their careers and enable companies to thrive with the perfect talent.",
    },
  ];

  return (
    <div className="min-h-screen md:py-16 lg:py-28 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Dynamic background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full opacity-10 blur-3xl animate-blob"></div>
        <div className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-10 blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-28 lg:py-2">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative md:text-3xl lg:text-3xl font-extrabold text-center mb-12 py-2 leading-tight"
        >
          <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            How We Bring Talent and Opportunity Together
          </span>
        </motion.h1>

        <div className="space-y-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex items-center mb-4">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center mr-4 shadow-lg"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 20px rgba(79, 70, 229, 0.4)",
                  }}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {step.title}
                </h2>
              </div>
              <motion.div
                className="ml-20 bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl p-6 hover:shadow-2xl transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <p className="text-gray-700 mb-4 text-lg">{step.description}</p>
                <div className="flex flex-col sm:flex-row justify-between text-sm space-y-2 sm:space-y-0">
                  <div className="flex items-center text-indigo-600">
                    <span className="font-semibold">Candidates:</span>
                    <ChevronRight className="w-4 h-4 mx-1" />
                    <span>{step.candidateAction}</span>
                  </div>
                  <div className="flex items-center text-purple-600">
                    <span className="font-semibold">Employers:</span>
                    <ChevronRight className="w-4 h-4 mx-1" />
                    <span>{step.employerAction}</span>
                  </div>
                </div>
              </motion.div>
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 to-purple-300"></div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-20 text-center"
        >
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            We're more than just a job platform. We're a catalyst for career
            growth and business success, creating a symbiotic ecosystem where
            talent meets opportunity.
          </p>
          <motion.button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-10 rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Join Our Community
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
