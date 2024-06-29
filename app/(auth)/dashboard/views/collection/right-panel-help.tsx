import React from 'react';
import { motion } from 'framer-motion';
import { Info, BookOpen, Edit3, LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

interface InstructionCardProps {
  title: string;
  content: string;
  icon: LucideIcon;
}

const InstructionCard: React.FC<InstructionCardProps> = ({ title, content, icon: Icon }) => (
  <motion.div variants={itemVariants}>
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center space-x-2 pb-2">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-sm">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{content}</p>
      </CardContent>
    </Card>
  </motion.div>
);

export function CollectRightPanelStart() {
  return (
    <motion.div
      className="h-full overflow-auto py-4 px-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <InstructionCard
        title="Collections: Streamline Your Job Descriptions"
        content="Collections are pre-written, reusable snippets of information about your company, categorized into introductions and benefits. These snippets are automatically incorporated when using the Job Description Builder and can be manually inserted into your job descriptions using the editor."
        icon={Info}
      />

      <InstructionCard
        title="Set Your Primary Snippets"
        content="For each category (introductions and benefits), set one snippet as the primary option. The AI will use these primary snippets by default when generating job descriptions. To set a snippet as primary, simply toggle the switch next to it."
        icon={BookOpen}
      />

      <InstructionCard
        title="Customize Your Generated Job Descriptions"
        content="After the AI generates a job description, easily customize it by replacing sections with any of your saved snippets. Click on the desired section and select a snippet from the menu to replace it. Collections ensure consistent branding and messaging while allowing for flexibility and customization."
        icon={Edit3}
      />
    </motion.div>
  );
}