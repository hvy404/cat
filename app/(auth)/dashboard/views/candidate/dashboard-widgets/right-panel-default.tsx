import React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Search,
  Briefcase,
  Wand2,
  CheckCircle,
  InfoIcon,
  TrendingUp,
  Bell,
  RefreshCw,
  Compass,
  X,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { manageDashboardRightPanelIntro } from "@/lib/candidate/onboarding-tip-resume";

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
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
}) => (
  <motion.div
    className="w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4"
    variants={itemVariants}
  >
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-gray-100 rounded-full flex-shrink-0">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
);

const features = [
  {
    icon: Mail,
    title: "Job Matches",
    description:
      "Explore personalized job recommendations tailored to your skills and experience.",
  },
  {
    icon: Wand2,
    title: "Resume Builder",
    description:
      "Create and optimize your resume with our AI-powered Resume Copilot.",
  },
  {
    icon: Briefcase,
    title: "Application Tracking",
    description:
      "Monitor your job applications and receive real-time status updates.",
  },
  {
    icon: Search,
    title: "Job Search",
    description:
      "Use our powerful search tools to find the perfect job opportunities matching your skills and preferences.",
  },
];

const WelcomeContent = () => (
  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-lg rounded-xl overflow-hidden">
    <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-6">
      <CardTitle className="text-xl font-bold flex items-center">
        <Compass className="h-6 w-6 mr-3" />
        Welcome to Your Career Dashboard
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        Discover powerful tools and features to accelerate your job search and
        career growth.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-white bg-opacity-50 rounded-lg p-4 transition-all duration-300 hover:bg-opacity-70 hover:shadow-md"
            variants={itemVariants}
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gray-200 rounded-full flex-shrink-0">
                <feature.icon className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </CardContent>
    <CardFooter className="bg-gray-100 p-4">
      <p className="text-xs text-gray-600 font-medium flex items-center">
        <InfoIcon className="h-4 w-4 mr-2" />
        Keep your profile updated to maximize your career opportunities
      </p>
    </CardFooter>
  </Card>
);

const ContinuousCareerPipelineCard = ({
  onDismiss,
}: {
  onDismiss: () => void;
}) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-100 shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <CardTitle className="text-xl font-bold flex items-center justify-between">
          <div className="flex items-center">
            <RefreshCw className="h-6 w-6 mr-3" />
            Continuous Career Pipeline
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 hover:text-white"
            onClick={onDismiss}
          >
            <X className="h-4 w-4 mr-2" />
            Got it, don't show again
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-sm text-gray-700 mb-6 leading-relaxed">
          Our intelligent system works diligently behind the scenes to support
          your career growth. By keeping your profile up-to-date, you'll be
          well-positioned to discover new opportunities as they arise.
        </p>
        <ul className="space-y-4">
          {[
            {
              icon: CheckCircle,
              text: "Intelligent job matching based on your evolving skills and experience",
            },
            {
              icon: TrendingUp,
              text: "Advanced AI algorithms identify your potential for higher-level roles",
            },
            {
              icon: Bell,
              text: "Smart notifications for perfectly aligned opportunities",
            },
            {
              icon: RefreshCw,
              text: "Effortless career management - no daily logins or manual searches required",
            },
          ].map((item, index) => (
            <li
              key={index}
              className="flex items-start bg-white bg-opacity-50 rounded-lg p-3 transition-all duration-300 hover:bg-opacity-70 hover:shadow-md"
            >
              <item.icon className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{item.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="bg-indigo-50 p-4">
        <p className="text-xs text-indigo-700 font-medium flex items-center">
          <InfoIcon className="h-4 w-4 mr-2" />
          Maintain an accurate, up-to-date profile for optimal career
          recommendations
        </p>
      </CardFooter>
    </Card>
  </motion.div>
);

const WelcomePanel = () => {
  const { user } = useUser();
  const dialogDismissed = (user?.publicMetadata?.["4"] as string) === "true";

  const handleDismiss = async () => {
    try {
      await manageDashboardRightPanelIntro();
      if (user) {
        await user.reload();
      }
    } catch (error) {
      // TODO: Implement proper error handling and display
    }
  };

  return (
    <motion.div
      className="flex flex-col items-start h-full justify-start md:p-6 space-y-6 bg-gray-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {dialogDismissed ? (
        <WelcomeContent />
      ) : (
        <ContinuousCareerPipelineCard onDismiss={handleDismiss} />
      )}
    </motion.div>
  );
};

export default WelcomePanel;
