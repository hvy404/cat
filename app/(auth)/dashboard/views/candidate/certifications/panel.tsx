import React, { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Award, Check, ChevronDown, ChevronUp } from 'lucide-react';

type SectionKey = 'importance' | 'whichOnes' | 'howUsed';

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
    whichOnes: false,
    howUsed: false,
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
        <h2 className="text-lg font-bold text-gray-800 mb-6">Certification Guide</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Adding relevant certifications to your profile helps us match you with the best job opportunities in the professional and government contractor space.
        </p>

        <Section
          title="Importance of Certifications"
          content={
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Demonstrates your expertise and commitment to professional development</li>
              <li>Increases your visibility to potential employers</li>
              <li>Can lead to higher-paying job opportunities</li>
              <li>Validates your skills in specific areas</li>
            </ul>
          }
          icon={<AlertCircle size={20} className="text-blue-500" />}
          section="importance"
        />

        <Section
          title="Which Certifications to Add"
          content={
            <div className="space-y-3 text-gray-600">
              <p>Focus on adding certifications that are:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Relevant to your target job roles</li>
                <li>Recognized in your industry</li>
                <li>Current and not expired</li>
                <li>From reputable organizations</li>
              </ul>
              <p>Quality over quantity: It's better to have a few highly relevant certifications than many unrelated ones.</p>
            </div>
          }
          icon={<Award size={20} className="text-green-500" />}
          section="whichOnes"
        />

        <Section
          title="How We Use Your Certifications"
          content={
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Our AI-powered matching algorithm considers your certifications when recommending job opportunities</li>
              <li>We use certifications to filter candidates for employers</li>
              <li>We may suggest additional certifications that could enhance your opportunities</li>
            </ul>
          }
          icon={<Check size={20} className="text-purple-500" />}
          section="howUsed"
        />
      </div>
    </div>
  );
}