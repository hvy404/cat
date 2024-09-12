"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AnchorFeaturesSection } from "./sections-homepage/anchor-features";
import { HowItWorks } from "./sections-homepage/how-it-works";
import { SmartMatchingSection } from "./sections-homepage/smart-matching";
import { FinalCTA } from "./sections-homepage/call-to-action";
import { WhySection } from "./sections-homepage/why";
import SignUp from "../candidate/sign-up-main";

const CandidateMain = () => {
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

  const handleSmoothScroll = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.querySelector("#the-difference");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen relative overflow-hidden">
        <div className="relative isolate px-6 pt-14 lg:px-8 z-10">
          <div className="mx-auto max-w-7xl py-24 lg:py-56">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-center"
            >
              <motion.h1
                variants={itemVariants}
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.2]"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Navigating Careers
                </span>{" "}
                Empowering Futures
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-xl sm:text-2xl leading-8 text-gray-700 mb-12 max-w-3xl mx-auto"
              >
                We're simplifying the job search journey, combining human
                insight with AI assistance to help you find meaningful
                opportunities that align with your unique skills and
                aspirations.
              </motion.p>

              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <a
                  onClick={handleSmoothScroll}
                  className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 inline-flex items-center transition-all duration-300"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
        {/* Abstract Shape Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg
            className="absolute w-full h-full"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d="M0,1000 C200,800 350,900 500,750 C650,600 700,750 800,600 C900,450 1000,500 1000,500 V1000 H0"
              fill="url(#grad)"
            >
              <animate
                attributeName="d"
                dur="20s"
                repeatCount="indefinite"
                values="
              M0,1000 C200,800 350,900 500,750 C650,600 700,750 800,600 C900,450 1000,500 1000,500 V1000 H0;
              M0,1000 C150,850 300,950 450,800 C600,650 750,700 850,550 C950,400 1000,450 1000,450 V1000 H0;
              M0,1000 C200,800 350,900 500,750 C650,600 700,750 800,600 C900,450 1000,500 1000,500 V1000 H0"
              />
            </path>
          </svg>
        </div>
      </div>
      <WhySection />
      <SmartMatchingSection />
      <AnchorFeaturesSection />

      <HowItWorks />

      <FinalCTA />
      <div id="signup">
        <SignUp />
      </div>
    </>
  );
};

export default CandidateMain;
