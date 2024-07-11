import React from "react";
import { motion } from "framer-motion";
import { Users, FileText, Clock } from "lucide-react";

export function NewApplicantAlertsPanel() {
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
        hidden: { opacity: 0, y: 0 },
        visible: {
          opacity: 1,
          y: 0,
        },
      };

  const ExplanationCard = ({ icon: Icon, title, content }: { icon: React.ElementType; title: string; content: string }) => (
    <motion.div
      className="w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
      variants={itemVariants}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-full">
            <Icon className="w-5 h-5 text-gray-600" />
          </div>
          <h3 className="text-md font-semibold text-gray-800">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      className="flex flex-col items-start h-full justify-start p-6 md:p-8 lg:p-12 space-y-6 bg-gray-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-lg font-bold text-gray-800">New Applicant Email Alerts</h2>
      
      <ExplanationCard 
        icon={FileText} 
        title="Instant Resume Notifications"
        content="Receive immediate email alerts when candidates apply to your job postings, ensuring you're always aware of new submissions as they arrive."
      />
      
      <ExplanationCard 
        icon={Clock} 
        title="Timely Response"
        content="React quickly to incoming applications, giving you the opportunity to engage promising candidates before your competitors."
      />

      <ExplanationCard 
        icon={Users} 
        title="Streamlined Candidate Management"
        content="Keep track of your applicant pool effortlessly, with email notifications helping you maintain an organized and efficient hiring process."
      />

      <motion.p 
        className="text-sm text-gray-600 italic"
        variants={itemVariants}
      >
        Enable "New applicant notifications" to stay on top of your hiring process and never miss out on potential candidates who are interested in your job openings.
      </motion.p>
    </motion.div>
  );
}