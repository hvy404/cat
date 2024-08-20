import React from 'react';
import { motion } from 'framer-motion';
import { Search, Zap, Lightbulb, RefreshCw, Target, Filter, Compass, InfoIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div
    className="w-full bg-white bg-opacity-50 rounded-lg p-4 transition-all duration-300 hover:bg-opacity-70 hover:shadow-md"
    variants={itemVariants}
  >
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-gray-200 rounded-full flex-shrink-0">
        <Icon className="w-5 h-5 text-gray-700" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
);

const features = [
  {
    icon: Search,
    title: "Profile-Powered Search",
    description: "Our algorithm uses your profile information to find highly relevant job opportunities."
  },
  {
    icon: Zap,
    title: "Tailored Results",
    description: "See only the jobs that match your unique blend of skills and experience."
  },
  {
    icon: Lightbulb,
    title: "Continuous Learning",
    description: "The more you interact, the smarter our search becomes at understanding your preferences."
  },
  {
    icon: RefreshCw,
    title: "Real-Time Updates",
    description: "Receive instant notifications for new opportunities that match your evolving profile."
  },
  {
    icon: Target,
    title: "Precision Matching",
    description: "Advanced algorithms ensure each job recommendation is a potential perfect fit for your career trajectory."
  },
  {
    icon: Filter,
    title: "Smart Filtering",
    description: "Utilize advanced filters to fine-tune your search results and discover your ideal positions."
  }
];

export default function EnhancedSearchInfo() {
  return (
    <motion.div
      className="flex flex-col items-start h-full justify-start md:p-6 space-y-6 bg-gray-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="w-full bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-6">
          <CardTitle className="text-xl font-bold flex items-center">
            <Compass className="h-6 w-6 mr-3" />
            Smart Search: Your Career Compass
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Smart Search combines cutting-edge technology with your unique professional profile to uncover the perfect opportunities tailored just for you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-100 p-4">
          <p className="text-xs text-gray-600 font-medium flex items-center">
            <InfoIcon className="h-4 w-4 mr-2" />
            Keep your profile updated to maximize your career opportunities
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}