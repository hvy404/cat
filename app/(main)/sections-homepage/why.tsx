import React from "react";
import { motion } from "framer-motion";
import { Shield, Target, Zap } from "lucide-react";

export const WhySection: React.FC = () => {
  const points = [
    {
      icon: Shield,
      title: "Your Career Ally",
      description: "Navigate the complexities of job hunting with a platform that understands and adapts to your unique journey.",
      gradient: "from-blue-400 to-indigo-600",
    },
    {
      icon: Target,
      title: "Quality Over Quantity",
      description: "Focus on opportunities that truly matter. We filter the noise, so you can concentrate on your ideal roles.",
      gradient: "from-purple-400 to-pink-600",
    },
    {
      icon: Zap,
      title: "Efficiency Redefined",
      description: "Streamline your job search process. Let our AI handle the repetitive tasks, while you focus on preparing for your next big move.",
      gradient: "from-teal-400 to-green-600",
    }
  ];

  const handleSignup = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.querySelector("#signup");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="the-difference" className="py-24 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center mb-6"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Reimagining Your Career Journey
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-center mb-16 text-gray-600 max-w-3xl mx-auto"
        >
          In today's fast-paced job market, finding the right opportunity shouldn't feel like searching for a needle in a haystack. We're here to change that narrative.
        </motion.p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {points.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out rounded-xl blur-xl -z-10" />
              <div className="bg-white bg-opacity-80 backdrop-blur-lg rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative z-10 h-full flex flex-col">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${point.gradient} flex items-center justify-center mb-6`}>
                  <point.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">{point.title}</h3>
                <p className="text-gray-600 flex-grow">{point.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <p className="text-lg text-gray-700 mb-8">
            Your time is valuable. Your potential is immense. Let's unlock it together.
          </p>
          <motion.button
          onClick={handleSignup}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Start Your Journey
          </motion.button>
        </motion.div>
      </div>

      {/* Abstract Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <svg className="absolute w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="empathy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path d="M0,1000 C200,800 350,900 500,750 C650,600 700,750 800,600 C900,450 1000,500 1000,500 V1000 H0" fill="url(#empathy-grad)">
            <animate attributeName="d" dur="20s" repeatCount="indefinite" values="
              M0,1000 C200,800 350,900 500,750 C650,600 700,750 800,600 C900,450 1000,500 1000,500 V1000 H0;
              M0,1000 C150,850 300,950 450,800 C600,650 750,700 850,550 C950,400 1000,450 1000,450 V1000 H0;
              M0,1000 C200,800 350,900 500,750 C650,600 700,750 800,600 C900,450 1000,500 1000,500 V1000 H0"
            />
          </path>
        </svg>
      </div>
    </section>
  );
};

export default WhySection;