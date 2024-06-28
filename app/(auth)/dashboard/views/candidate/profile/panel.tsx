import React, { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Building, ChevronDown, ChevronUp, Info } from 'lucide-react';

type SectionKey = 'personalInfo' | 'securityClearance' | 'profileTips';

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
    personalInfo: false,
    securityClearance: false,
    profileTips: false,
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
        <h2 className="text-md font-bold text-gray-800 mb-6">Profile Management</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Your public profile is crucial for matching you with federal contracting opportunities. Keep your information up-to-date to improve your chances of finding the perfect placement.
        </p>

        <Section
          title="Personal Information"
          content={
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Name: How you'll be identified to potential employers</li>
              <li>Email: Your primary contact method for opportunities</li>
              <li>Location (City, State, Zip): Highly recommended as employers often search by location</li>
              <li>Ensure all information is accurate and professional</li>
            </ul>
          }
          icon={<User size={20} className="text-blue-500" />}
          section="personalInfo"
        />

        <Section
          title="Security Clearance"
          content={
            <div className="space-y-3 text-gray-600">
              <p>Your security clearance level is crucial for many positions:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Select your current clearance level accurately</li>
                <li>Update promptly if your clearance status changes</li>
                <li>This information helps match you with appropriate opportunities</li>
              </ul>
            </div>
          }
          icon={<Shield size={20} className="text-green-500" />}
          section="securityClearance"
        />

        <Section
          title="Profile Optimization Tips"
          content={
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Use a professional email address</li>
              <li>Double-check all entered information for accuracy</li>
              <li>Regularly update your profile to reflect current skills and clearances</li>
              <li>Employers often have strict placement criteria; the more complete your profile, the better your chances of matching</li>
              <li>Ensure your security clearance information is always up-to-date</li>
            </ul>
          }
          icon={<Info size={20} className="text-purple-500" />}
          section="profileTips"
        />
      </div>
    </div>
  );
}