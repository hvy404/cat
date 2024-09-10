import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Upload, RefreshCw, UserCheck, Bell } from 'lucide-react';

const ContinuousTalentPipelineSection = () => {
  const steps = [
    {
      icon: <Upload className="w-12 h-12 text-blue-400" />,
      title: "Upload Your Job",
      description: "Simply post your job requirements and let our AI-powered system take over."
    },
    {
      icon: <RefreshCw className="w-12 h-12 text-green-400" />,
      title: "Continuous Matching",
      description: "Our platform works 24/7 to evaluate and match candidates to your job."
    },
    {
      icon: <UserCheck className="w-12 h-12 text-purple-400" />,
      title: "Quality Assurance",
      description: "AI-driven algorithms ensure only the best matches are surfaced."
    },
    {
      icon: <Bell className="w-12 h-12 text-yellow-400" />,
      title: "Instant Notifications",
      description: "Get alerted when high-quality candidates are identified for your role."
    }
  ];

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.2 });

  return (
    <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Your Always-On Talent Scout</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the power of a continuous talent pipeline, working tirelessly to bring you the perfect candidates.
          </p>
        </motion.div>

        <div className="relative" ref={containerRef}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
          </div>

          <div className="relative z-10 space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                  <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-300">{step.description}</p>
                </div>
                <div className="relative flex items-center justify-center w-24 h-24">
                  <motion.div
                    className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-lg absolute"
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
                  ></motion.div>
                  <motion.div
                    className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center relative z-10"
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                  >
                    {step.icon}
                  </motion.div>
                </div>
                <div className="w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-24 text-center"
        >
          <p className="text-2xl text-white font-semibold mb-8">
            Set it and forget it. Let our AI-powered system build your continuous talent pipeline.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-gradient-to-r from-pink-500 to-orange-500 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:from-pink-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 inline-flex items-center transition-all duration-300"
          >
            Start Your Talent Pipeline
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default ContinuousTalentPipelineSection;