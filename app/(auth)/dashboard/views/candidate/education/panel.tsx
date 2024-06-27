import React, { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Book, GraduationCap, ChevronDown, ChevronUp, Compass } from 'lucide-react';

type SectionKey = 'importance' | 'whatToInclude' | 'personalGrowth';

type ExpandedState = {
  [K in SectionKey]: boolean;
};

interface SectionProps {
  title: string;
  content: ReactNode;
  icon: ReactNode;
  section: SectionKey;
}

export default function RightPanel() {
  const [expanded, setExpanded] = useState<ExpandedState>({
    importance: false,
    whatToInclude: false,
    personalGrowth: false,
  });

  const toggleSection = (section: SectionKey) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const Section: React.FC<SectionProps> = ({ title, content, icon, section }) => (
    <div className="mb-4">
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full p-3 text-left text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
      >
        <div className="flex items-center">
          {icon}
          <span className="ml-2 font-semibold text-sm">{title}</span>
        </div>
        {expanded[section] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: expanded[section] ? 'auto' : 0, opacity: expanded[section] ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-3 bg-white rounded-b-md border border-gray-200 border-t-0 text-sm">
          {content}
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-[90vh] rounded-xl bg-gray-50 overflow-auto">
      <div className="relative h-full w-full p-6">
        <h2 className="text-md font-bold text-gray-800 mb-6">Education Management</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Your educational background is a crucial part of your professional profile. Here's how to effectively showcase your academic achievements and reflect on your personal growth.
        </p>

        <Section
          title="Importance of Education"
          content={
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Demonstrates your academic qualifications and knowledge base</li>
              <li>Highlights your commitment to learning and self-improvement</li>
              <li>Can be a key differentiator for certain job roles</li>
              <li>Provides context for your career trajectory</li>
            </ul>
          }
          icon={<Book size={20} className="text-blue-500" />}
          section="importance"
        />

        <Section
          title="What to Include"
          content={
            <div className="space-y-3 text-gray-600">
              <p>For each educational entry, include:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Degree or certification name</li>
                <li>Major or field of study</li>
                <li>Institution name</li>
                <li>Graduation date (or expected graduation date)</li>
                <li>Relevant coursework, projects, or thesis topics</li>
                <li>Academic achievements or honors</li>
              </ul>
            </div>
          }
          icon={<GraduationCap size={20} className="text-green-500" />}
          section="whatToInclude"
        />

        <Section
          title="Personal Growth and Career Development"
          content={
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Reflect on how your education has shaped your professional goals</li>
              <li>Identify key skills and knowledge you've gained through your studies</li>
              <li>Consider how your educational experiences have influenced your work ethic and approach to challenges</li>
              <li>Think about how your academic background aligns with your desired career path</li>
              <li>Recognize the value of both formal education and lifelong learning in your professional journey</li>
            </ul>
          }
          icon={<Compass size={20} className="text-purple-500" />}
          section="personalGrowth"
        />
      </div>
    </div>
  );
}