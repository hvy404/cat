"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, BarChart, Eye, Lock, Check } from 'lucide-react';

const ResponsibleAIPage = () => {
  const sections = [
    {
      icon: Shield,
      title: "Fairness in Matching",
      content: "Our algorithms focus solely on skills, experience, and qualifications. Factors such as gender, ethnicity, age, or name do not influence matching results.",
      gradient: "from-blue-400 to-indigo-600",
    },
    {
      icon: Users,
      title: "Diverse Development Team",
      content: "Our technology is developed by a diverse team of experts, ensuring a wide range of perspectives are considered in its design and implementation.",
      gradient: "from-purple-400 to-pink-600",
    },
    {
      icon: BarChart,
      title: "Regular Audits",
      content: "We conduct regular audits of our systems to detect and correct any unintended biases, ensuring consistent fairness across all user groups.",
      gradient: "from-teal-400 to-green-600",
    },
    {
      icon: Eye,
      title: "Transparency",
      content: "We're committed to being clear about how our technology works. We provide general information about our matching process to help users understand our approach.",
      gradient: "from-orange-400 to-red-600",
    },
    {
      icon: Lock,
      title: "Data Privacy",
      content: "Personal information is protected and never used to train our models. We adhere to strict data protection regulations to safeguard your privacy.",
      gradient: "from-yellow-400 to-orange-600",
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-32 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl lg:text-5xl font-bold text-center mb-6"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Our Commitment to Fairness
          </span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl text-center mb-20 text-gray-600 max-w-3xl mx-auto"
        >
          We're dedicated to creating a fair and inclusive platform. Our technology is designed with ethical considerations at its core, ensuring equal opportunities for all users.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${section.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out rounded-xl blur-xl -z-10`} />
              <div className="bg-white bg-opacity-80 backdrop-blur-lg rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative z-10 h-full flex flex-col">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-6`}>
                  <section.icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">{section.title}</h2>
                <p className="text-gray-600 flex-grow">{section.content}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-10 max-w-4xl mx-auto text-white shadow-2xl"
        >
          <h2 className="text-3xl font-bold mb-6">Our Ongoing Commitment</h2>
          <p className="text-lg mb-8 opacity-90">
            We are dedicated to continuously improving our systems to ensure fairness and equality for all users. Your success is our priority, and we strive to provide a level playing field for every job seeker on our platform.
          </p>
          <div className="flex items-center bg-white bg-opacity-20 rounded-full py-3 px-6 w-fit">
            <Check className="w-6 h-6 mr-3" />
            <span className="font-semibold">Fairness is at the core of what we do</span>
          </div>
        </motion.div>
      </div>

      {/* Abstract Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <svg className="absolute w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path d="M0,1000 C200,800 350,900 500,750 C650,600 700,750 800,600 C900,450 1000,500 1000,500 V1000 H0" fill="url(#grad)">
            <animate attributeName="d" dur="20s" repeatCount="indefinite" values="
              M0,1000 C200,800 350,900 500,750 C650,600 700,750 800,600 C900,450 1000,500 1000,500 V1000 H0;
              M0,1000 C150,850 300,950 450,800 C600,650 750,700 850,550 C950,400 1000,450 1000,450 V1000 H0;
              M0,1000 C200,800 350,900 500,750 C650,600 700,750 800,600 C900,450 1000,500 1000,500 V1000 H0"
            />
          </path>
        </svg>
      </div>
    </div>
  );
};

export default ResponsibleAIPage;