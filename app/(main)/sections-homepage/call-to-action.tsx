import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";

export const FinalCTA: React.FC = () => {
  const benefits = [
    "AI-powered resume optimization",
    "Tailored job matching",
    "Career growth insights",
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold mb-6"
            >
              Elevate Your Career Journey Today
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl mb-8"
            >
              Join the network of professionals who have already transformed their job search experience.
            </motion.p>
            <ul className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex items-center"
                >
                  <CheckCircle className="h-6 w-6 mr-3 text-teal-300" />
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl font-semibold mb-4"
            >
              Ready to Take the Next Step?
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              Create your account now and start your journey towards your dream career.
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-white text-indigo-700 font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition-colors duration-300 hover:bg-indigo-100"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;