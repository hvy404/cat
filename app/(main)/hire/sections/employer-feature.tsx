import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Users, BarChart, Calendar, Search, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Card className="h-full bg-white/10 backdrop-blur-lg border-none text-white hover:bg-white/20 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);
const EmployerFeaturesSection = () => {
  const features = [
    {
      icon: <FileText className="w-6 h-6 text-blue-400" />,
      title: "AI-Assisted Job Descriptions",
      description: "Create compelling job postings with our AI to attract top talent."
    },
    {
      icon: <Users className="w-6 h-6 text-green-400" />,
      title: "Smart Candidate Matching",
      description: "Our AI algorithm finds the perfect candidates for your roles."
    },
    {
      icon: <BarChart className="w-6 h-6 text-purple-400" />,
      title: "Insights Dashboard",
      description: "Get valuable hiring insights and analytics at a glance."
    },
    {
      icon: <Calendar className="w-6 h-6 text-yellow-400" />,
      title: "Interview Management",
      description: "Streamline your interview process with our scheduling tools."
    },
    {
      icon: <Search className="w-6 h-6 text-red-400" />,
      title: "Advanced Candidate Search",
      description: "Find the right talent with powerful search and filtering options."
    },
    {
      icon: <Zap className="w-6 h-6 text-indigo-400" />,
      title: "SOW Analysis",
      description: "AI-powered parsing of Statements of Work for complex projects."
    }
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Empower Your Hiring Process</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover how our AI-powered platform can transform your recruitment strategy and help you find the best talent.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center transition-all duration-300"
          >
            Schedule a Demo
            <ArrowRight className="ml-2 h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default EmployerFeaturesSection;