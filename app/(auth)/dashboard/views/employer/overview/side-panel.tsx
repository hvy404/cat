import React from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Users,
  Zap,
  FileText,
  BarChart,
  MessageSquare,
  Compass,
  InfoIcon,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

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

const FeatureCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
}> = ({ icon: Icon, title, description }) => (
  <motion.div
    className="w-full bg-white bg-opacity-50 rounded-lg p-4 transition-all duration-300 hover:bg-opacity-70 hover:shadow-md"
    variants={itemVariants}
  >
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-gray-200 rounded-full flex-shrink-0">
        <Icon className="w-5 h-5 text-gray-700" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
);

const features = [
  {
    icon: MessageSquare,
    title: "Autonomous Recruitment Pipeline",
    description:
      "Build a fully automated candidate sourcing and screening process.",
  },
  {
    icon: Users,
    title: "Intelligent Candidate Matching",
    description:
      "Find ideal candidates with our advanced machine learning algorithms.",
  },
  {
    icon: Briefcase,
    title: "Smart Job Postings",
    description:
      "Create and manage your job listings with data-driven optimized descriptions.",
  },
  {
    icon: Zap,
    title: "Quick Hire",
    description: "Streamline your hiring process and reduce time-to-hire.",
  },
  {
    icon: FileText,
    title: "Automated Resume Analysis",
    description: "Get data-driven insights from candidate resumes.",
  },
  {
    icon: BarChart,
    title: "Analytics",
    description: "Track your hiring performance and recruitment metrics.",
  }
];


const EmployerDashboardMainSidePanel = () => {
  return (
    <motion.div
      className="flex flex-col items-start h-full justify-start p-4 space-y-6 bg-gray-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="w-full bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-6">
          <CardTitle className="text-xl font-bold flex items-center">
            <Compass className="h-6 w-6 mr-3" />
            AI-Powered Recruiting Hub
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Explore our features to revolutionize your hiring process and find
            the perfect candidates for your team.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EmployerDashboardMainSidePanel;
