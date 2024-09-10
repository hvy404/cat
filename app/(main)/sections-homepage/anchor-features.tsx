import React from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp, Users, Cpu, Network } from "lucide-react";

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
          className="text-4xl font-bold mb-20 text-center text-gray-800 leading-tight"
        >
          Automate Your <span className="text-indigo-600">Career Growth</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {[
            {
              icon: Cpu,
              title: "Adaptive Learning",
              description:
                "Our platform analyzes your progress and tailors recommendations to your evolving career path.",
            },
            {
              icon: Network,
              title: "Industry Insights",
              description:
                "Stay ahead with data-driven predictions of emerging skills in your field.",
            },
            {
              icon: TrendingUp,
              title: "Growth Tracking",
              description:
                "Visualize your professional growth with dynamic, AI-generated career trajectories.",
            },
            {
              icon: Users,
              title: "Personalized Matching",
              description:
                "Connect with opportunities that align perfectly with your unique professional DNA.",
            },
          ].map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </motion.section>
  );
};
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}) => (
  <motion.div
    variants={itemVariants}
    className="bg-white rounded-xl p-8 transition-all duration-300 hover:shadow-lg border border-indigo-100 group hover:border-indigo-200"
  >
    <div className="flex items-center mb-6">
      <div className="w-14 h-14 mr-6 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-all duration-300">
        <Icon className="w-7 h-7 text-indigo-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
        {title}
      </h3>
    </div>
    <p className="text-gray-600 text-base leading-relaxed">{description}</p>
  </motion.div>
);
