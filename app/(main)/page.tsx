"use client";
import React from "react";
import { useAuth } from "@clerk/nextjs";
import SignUp from "../candidate/sign-up-main";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Target, Briefcase } from "lucide-react";
import { AnchorFeaturesSection } from "@/app/(main)/sections-homepage/anchor-features";
import { HowItWorks } from "@/app/(main)/sections-homepage/how-it-works";
import { TopEmployersSection } from "@/app/(main)/sections-homepage/top-employer";
import { SmartMatchingSection } from "@/app/(main)/sections-homepage/smart-matching";

const Main = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 min-h-screen">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-7xl py-20 sm:py-32 lg:py-40">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-16">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 mb-12 lg:mb-0 text-center lg:text-left"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-8 leading-[1.2] py-2 overflow-visible">
                <span>Your Professional Journey</span>{" "}
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear",
                    repeatDelay: 4,
                  }}
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  +
                </motion.span>{" "}
                <span>Smart Career Solutions</span>
              </h1>

              <p className="text-lg sm:text-xl leading-8 text-gray-700 mb-12 max-w-2xl mx-auto lg:mx-0">
                Unleash your career potential through an advanced platform
                integrating intelligent resume optimization, tailored job
                matching, and powerful career growth tools.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <a
                  href="#signup"
                  className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 inline-flex items-center transition-all duration-300"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </motion.div>
            </motion.div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 space-y-8"
            >
              <FeatureCard
                icon={<Target className="h-8 w-8 text-indigo-600" />}
                title="Smart Job Matching"
                description="Discover opportunities that align perfectly with your profile, powered by our advanced AI matching algorithm."
              />
              <FeatureCard
                icon={<Zap className="h-8 w-8 text-indigo-600" />}
                title="Opportunity Magnetism"
                description="Your dynamic profile becomes a magnet for ideal job opportunities, revealing exciting career paths you might never have discovered. As your profile evolves, new doors open automatically."
              />

              <FeatureCard
                icon={<Briefcase className="h-8 w-8 text-indigo-600" />}
                title="Career Growth Tools"
                description="Access personalized skill assessments and career path recommendations to continuously evolve your professional journey."
              />
            </motion.div>
          </div>
        </div>
      </div>
      <SmartMatchingSection />
      <AnchorFeaturesSection />
      <TopEmployersSection />
      <HowItWorks />
      <div id="signup">
        <SignUp />
      </div>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="bg-white rounded-xl shadow-lg p-6 flex items-start space-x-4 transition-all duration-300 hover:shadow-xl"
  >
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </motion.div>
);

export default Main;
