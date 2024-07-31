import React from 'react';
import { motion } from 'framer-motion';
import { Info, BookOpen, Edit3 } from 'lucide-react';

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

interface ExplanationCardProps {
  icon: React.ElementType;
  title: string;
  content: string;
}

const ExplanationCard: React.FC<ExplanationCardProps> = ({ icon: Icon, title, content }) => (
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

export function CollectRightPanelStart() {
  return (
    <motion.div
      className="flex flex-col items-start h-full justify-start p-6 md:p-8 lg:p-12 space-y-6 bg-gray-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-lg font-bold text-gray-800">Collections: Streamline Your Job Descriptions</h2>

      <ExplanationCard
        icon={Info}
        title="What are Collections?"
        content="Collections are pre-written, reusable snippets of information about your company, categorized into introductions and benefits. These snippets are automatically incorporated when using the Job Description Builder and can be manually inserted into your job descriptions using the editor."
      />

      <ExplanationCard
        icon={BookOpen}
        title="Set Your Primary Snippets"
        content="For each category (introductions and benefits), set one snippet as the primary option. The AI will use these primary snippets by default when generating job descriptions. To set a snippet as primary, simply toggle the switch next to it."
      />

      <ExplanationCard
        icon={Edit3}
        title="Customize Your Generated Job Descriptions"
        content="After the AI generates a job description, easily customize it by replacing sections with any of your saved snippets. Click on the desired section and select a snippet from the menu to replace it. Collections ensure consistent branding and messaging while allowing for flexibility and customization."
      />
    </motion.div>
  );
}