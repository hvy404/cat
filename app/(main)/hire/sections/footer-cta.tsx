import React, { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

const FinalCallToAction = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
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
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-14 w-full">
      <div
        className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        ref={ref}
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
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
          <div className="relative overflow-x-hidden">
            <motion.div
              className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] max-w-[300px] max-h-[300px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
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
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="relative z-10 text-center"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight"
          >
            Revolutionize Your Hiring
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              With AI-Powered Precision
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-700 mb-14 max-w-3xl mx-auto"
          >
            Unleash the full potential of your recruitment process. Our AI
            doesn't just find candidates; it curates a
            <span className="font-semibold text-blue-600">
              {" "}
              talent ecosystem{" "}
            </span>
            tailored to your unique needs.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center items-center space-y-5 sm:space-y-0 sm:space-x-6 mb-14"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full text-lg shadow-xl hover:shadow-2xl transition duration-300 flex items-center"
            >
              Transform Your Hiring Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </motion.button>
            <motion.a
              href="#"
              className="text-gray-700 hover:text-blue-600 transition duration-300 flex items-center text-lg font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Schedule a Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </motion.a>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            {[
              {
                icon: <Sparkles className="h-10 w-10 text-yellow-500" />,
                title: "AI-Driven Insights",
                description:
                  "Harness the power of AI to uncover hidden talent and predict candidate success.",
              },
              {
                icon: <Zap className="h-10 w-10 text-blue-500" />,
                title: "Lightning-Fast Matching",
                description:
                  "Reduce time-to-hire by 60% with our advanced matching algorithms.",
              },
              {
                icon: <Target className="h-10 w-10 text-green-500" />,
                title: "Precision Recruitment",
                description:
                  "Achieve a 90% candidate-role fit rate, minimizing turnover and maximizing productivity.",
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 p-7 rounded-2xl border-none">
                  <div className="flex flex-col items-center">
                    <div className="mb-5 p-2 bg-gray-100 rounded-full">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700 text-center text-base">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default FinalCallToAction;
