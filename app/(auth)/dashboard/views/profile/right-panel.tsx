import React from 'react';
import { motion } from 'framer-motion';
import { User, Bell, HelpCircle, LucideIcon } from 'lucide-react';
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

interface ProfileCardProps {
  title: string;
  content: string;
  icon: LucideIcon;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ title, content, icon: Icon }) => (
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

const ProfileRightPanel: React.FC = () => {
  return (
    <motion.div
      className="h-full overflow-auto py-4 px-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <ProfileCard
        title="Personal Information"
        content="Keep your personal details up to date. This information helps us tailor your experience and improves your visibility to potential employers."
        icon={User}
      />
      <ProfileCard
        title="Notification Preferences"
        content="Manage your email alerts for AI candidate matches and new job applicants. Stay informed without being overwhelmed."
        icon={Bell}
      />
      <ProfileCard
        title="Profile Completion Tips"
        content="A complete profile increases your chances of finding the right candidates. Make sure to fill out all sections and keep your information current."
        icon={HelpCircle}
      />
    </motion.div>
  );
};

export default ProfileRightPanel;