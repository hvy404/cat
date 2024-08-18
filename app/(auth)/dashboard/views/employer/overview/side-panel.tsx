import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Users, Zap, ChevronRight, LucideIcon, FileText, BarChart, MessageSquare, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="w-full transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {isHovered && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-muted-foreground"
            >
              {description}
            </motion.p>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

const EmployerDashboardMainSidePanel = () => {
  const features = [
    {
      icon: Briefcase,
      title: "Job Postings",
      description: "Create and manage your job listings with AI-optimized descriptions.",
    },
    {
      icon: Users,
      title: "Candidate Matching",
      description: "Find ideal candidates with our advanced AI matching algorithms.",
    },
    {
      icon: Zap,
      title: "Quick Hire",
      description: "Streamline your hiring process and reduce time-to-hire.",
    },
    {
      icon: FileText,
      title: "Resume Analysis",
      description: "Get AI-powered insights from candidate resumes.",
    },
    {
      icon: BarChart,
      title: "Analytics",
      description: "Track your hiring performance and recruitment metrics.",
    },
    {
      icon: MessageSquare,
      title: "Autonomous Recruitment Pipeline",
      description:
        "Build a fully automated candidate sourcing and screening process.",
    },
  ];

  return (
    <>
      <h2 className="text-xl font-bold text-gray-800">
        Welcome to Your AI-Powered Recruiting Hub
      </h2>
      <p className="text-sm text-gray-600">
        Explore our features to revolutionize your hiring process:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <motion.div key={index} variants={itemVariants}>
            <FeatureCard
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          </motion.div>
        ))}
      </div>

{/*       <div className="mt-auto">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Our AI assistant is here to guide you through any feature. Just ask!
            </p>
          </CardContent>
        </Card>
      </div> */}
    </>
  );
};

export default EmployerDashboardMainSidePanel;
