import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Target } from 'lucide-react';

const FinalCallToAction = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 py-24 overflow-hidden w-full">
      <div className="relative px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="relative z-10 text-center"
        >
          <motion.h2 variants={itemVariants} className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Revolutionize Your Hiring
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              With AI-Powered Precision
            </span>
          </motion.h2>

          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Unleash the full potential of your recruitment process. Our AI doesn't just find candidates; it curates a 
            <span className="font-semibold text-pink-300"> talent ecosystem </span> 
            tailored to your unique needs.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition duration-300 flex items-center"
            >
              Transform Your Hiring Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </motion.button>
            <motion.a
              href="#"
              className="text-gray-300 hover:text-white transition duration-300 flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Schedule a Demo
              <ArrowRight className="ml-1 h-4 w-4" />
            </motion.a>
          </motion.div>

          <motion.div variants={containerVariants} className="max-w-7xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={itemVariants} className="bg-white/10 backdrop-filter backdrop-blur-lg rounded-lg p-6 flex flex-col items-center">
              <Sparkles className="h-12 w-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">AI-Driven Insights</h3>
              <p className="text-gray-300 text-center">Harness the power of AI to uncover hidden talent and predict candidate success.</p>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-white/10 backdrop-filter backdrop-blur-lg rounded-lg p-6 flex flex-col items-center">
              <Zap className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Lightning-Fast Matching</h3>
              <p className="text-gray-300 text-center">Reduce time-to-hire by 60% with our advanced matching algorithms.</p>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-white/10 backdrop-filter backdrop-blur-lg rounded-lg p-6 flex flex-col items-center">
              <Target className="h-12 w-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Precision Recruitment</h3>
              <p className="text-gray-300 text-center">Achieve a 90% candidate-role fit rate, minimizing turnover and maximizing productivity.</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default FinalCallToAction;