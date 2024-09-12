"use client";
import React from "react";
import { motion } from "framer-motion";
import { Users, Briefcase, Target, Zap, Globe } from "lucide-react";

const AboutUsPage = () => {
  const missions = [
    {
      icon: Users,
      title: "Connecting Talent with Opportunity",
      description:
        "We're bridging the gap between skilled professionals and innovative companies, creating meaningful career connections.",
    },
    {
      icon: Briefcase,
      title: "Reimagining the Hiring Process",
      description:
        "Our AI-driven platform is transforming how companies find and engage with top talent, making hiring more efficient and effective.",
    },
    {
      icon: Target,
      title: "Empowering Career Growth",
      description:
        "We provide job seekers with the tools and insights they need to navigate their career paths and achieve their professional goals.",
    },
    {
      icon: Zap,
      title: "Streamlining Recruitment Workflows",
      description:
        "We're revolutionizing how recruiters work, providing intuitive tools and AI-driven insights to make hiring more efficient, accurate, and enjoyable.",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl lg:text-5xl font-bold text-center mb-8 text-gray-900"
        >
          About G2X Talent
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-center mb-16 text-gray-600 max-w-3xl mx-auto"
        >
          At G2X Talent, we're on a mission to revolutionize the way
          professionals find their dream careers and how companies discover
          exceptional talent. We believe in creating a future where the right
          opportunities meet the right people, effortlessly.
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {missions.map((mission, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                  <mission.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {mission.title}
                </h2>
              </div>
              <p className="text-gray-600">{mission.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-indigo-600 text-white rounded-xl shadow-xl p-12 relative overflow-hidden"
        >
          <h2 className="text-3xl font-bold mb-6">Our Vision for the Future</h2>
          <p className="text-lg mb-8">
            We envision a world where every professional can easily find
            fulfilling work that aligns with their skills and passions, and
            where companies can effortlessly connect with the talent they need
            to thrive. G2Xchange Talent is committed to making this vision a
            reality through continuous innovation and a deep understanding of
            the evolving job market.
          </p>
          <div className="flex items-center">
            <Globe className="w-8 h-8 mr-4" />
            <span className="text-xl font-semibold">
              Transforming careers and businesses globally
            </span>
          </div>
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-500 rounded-full opacity-20"></div>
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-indigo-400 rounded-full opacity-20"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-16 text-center"
        >
          <p className="text-xl text-gray-700 mb-8">
            Join us in shaping the future of work. Whether you're a job seeker
            looking to take the next step in your career or an employer seeking
            to build an exceptional team, G2Xchange Talent is here to support
            your journey.
          </p>
          <button className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-indigo-700 transition-colors duration-300 shadow-md hover:shadow-lg">
            Get Started with G2Xchange Talent
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUsPage;
