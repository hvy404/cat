import { motion } from 'framer-motion';
import { ArrowRight, Mail, Book, Briefcase } from 'lucide-react';

const WelcomePanel = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-[90vh] rounded-xl bg-gray-50 p-8 overflow-auto">
      <motion.h2 
        className="text-xl font-semibold mb-6 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome to Your Career Growth Journey
      </motion.h2>
      
      <motion.div 
        className="space-y-6"
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        initial="hidden"
        animate="visible"
      >
        <motion.section variants={sectionVariants} className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-gray-600" />
            Stay Connected
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Keep an eye on your inbox for personalized job recommendations and updates on your applications.
          </p>
          <a href="#" className="text-sm text-gray-700 hover:text-gray-900 flex items-center">
            Check Messages
            <ArrowRight className="w-4 h-4 ml-1" />
          </a>
        </motion.section>

        <motion.section variants={sectionVariants} className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
            <Book className="w-5 h-5 mr-2 text-gray-600" />
            Learn and Grow
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Explore our resources to enhance your skills and make your profile stand out to potential employers.
          </p>
          <a href="#" className="text-sm text-gray-700 hover:text-gray-900 flex items-center">
            Browse Resources
            <ArrowRight className="w-4 h-4 ml-1" />
          </a>
        </motion.section>

        <motion.section variants={sectionVariants} className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-gray-600" />
            Your Next Opportunity
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            We're here to help you find the perfect job. Let's take the next step in your career together.
          </p>
          <a href="#" className="text-sm text-gray-700 hover:text-gray-900 flex items-center">
            Explore Jobs
            <ArrowRight className="w-4 h-4 ml-1" />
          </a>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default WelcomePanel;