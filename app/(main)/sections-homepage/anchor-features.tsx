import React from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp, Users, Cpu, Network, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export const AnchorFeaturesSection = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const features = [
    {
      icon: Cpu,
      title: "Warm Introductions",
      description:
        "We thoughtfully present your profile to ideal employers, carefully showcasing your unique strengths and perfect-fit potential for their opportunities.",
      color: "from-blue-400 to-indigo-600",
    },
    {
      icon: Network,
      title: "Career Ally",
      description:
        "Your dedicated partner in professional growth, providing personalized guidance and support throughout your career journey.",
      color: "from-purple-400 to-pink-600",
    },
    {
      icon: TrendingUp,
      title: "Future-Focused Alignment",
      description:
        "Our AI continuously scans the horizon to identify emerging opportunities that align with your career trajectory and industry trends.",
      color: "from-green-400 to-teal-600",
    },
    {
      icon: Users,
      title: "Personalized Matching",
      description:
        "Connect with opportunities that align perfectly with your unique professional DNA.",
      color: "from-orange-400 to-red-600",
    },
  ];

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className="py-32 bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 text-gray-900 overflow-hidden relative"
    >
      <div className="max-w-7xl mx-auto px-8 lg:px-12 relative z-10">
        <motion.h2
          variants={itemVariants}
          className="text-5xl font-bold mb-6 text-center"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Automate
          </span>{" "}
          Your Career Growth
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="text-xl text-gray-700 text-center mb-20 max-w-3xl mx-auto"
        >
          The platform that propel your career forward and keeps you ahead in
          your industry.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>

      {/* Abstract Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        <svg
          className="absolute w-full h-full"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d="M0,1000 C200,800 350,900 500,750 C650,600 700,750 800,600 C900,450 1000,500 1000,500 V1000 H0"
            fill="url(#grad2)"
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
    </motion.section>
  );
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  color,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  index: number;
}) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300, damping: 10 }}
  >
    <Card className="p-8 transition-all duration-300 hover:shadow-xl border-none bg-white/90 backdrop-blur-sm group hover:bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 ease-in-out {color}" />
      <div className="relative z-10">
        <div className="flex items-center mb-6">
          <div
            className={`w-16 h-16 mr-6 rounded-2xl flex items-center justify-center bg-gradient-to-br {color}`}
          >
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
            {title}
          </h3>
        </div>
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          {description}
        </p>
        <motion.button
          whileHover={{ x: 5 }}
          className="text-indigo-600 font-medium flex items-center text-lg"
        >
          Learn more <ChevronRight className="ml-1 h-5 w-5" />
        </motion.button>
      </div>
    </Card>
  </motion.div>
);

export default AnchorFeaturesSection;
