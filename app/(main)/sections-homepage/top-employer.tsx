import React from "react";
import { motion, useInView } from "framer-motion";

export const TopEmployersSection = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 1 }}
      className="py-32 bg-white"
    >
      <div className="max-w-7xl mx-auto px-8 lg:px-12">
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-4xl font-bold text-gray-800 mb-16 text-center leading-tight"
        >
          Powering Careers at Industry Leaders
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {[
            "Google",
            "Amazon",
            "Microsoft",
            "Apple",
            "Facebook",
            "Netflix",
            "Tesla",
            "SpaceX",
          ].map((company, index) => (
            <motion.div
              key={company}
              initial={{ y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className="bg-gray-50 rounded-lg p-6 flex items-center justify-center transition-all duration-300 hover:bg-gray-100"
            >
              <span className="text-lg font-medium text-gray-700">{company}</span>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center"
        >
          <motion.a
            href="#signup"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-all duration-300"
          >
            Join Top Talent
          </motion.a>
        </motion.div>
      </div>
    </motion.section>
  );
};
