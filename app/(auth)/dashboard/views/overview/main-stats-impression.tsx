import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Users,
  TrendingUp,
  ChevronRight,
  Briefcase,
  BotIcon,
} from "lucide-react";

interface ChartDataPoint {
  date: string;
  inboundApplicants: number;
  aiRecommended: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  trend: number;
}

interface ChartCardProps {
  data: ChartDataPoint[];
}

const mockData: ChartDataPoint[] = [
  { date: "Mon", inboundApplicants: 12, aiRecommended: 5 },
  { date: "Tue", inboundApplicants: 19, aiRecommended: 7 },
  { date: "Wed", inboundApplicants: 15, aiRecommended: 8 },
  { date: "Thu", inboundApplicants: 22, aiRecommended: 10 },
  { date: "Fri", inboundApplicants: 30, aiRecommended: 15 },
  { date: "Sat", inboundApplicants: 18, aiRecommended: 9 },
  { date: "Sun", inboundApplicants: 14, aiRecommended: 6 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.2,
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
      stiffness: 70,
      damping: 20,
    },
  },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
}) => (
  <motion.div variants={itemVariants}>
    <Card className="w-full h-full bg-white shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-semibold text-gray-800 flex items-center">
          <Icon className="w-4 h-4 mr-2 text-gray-700" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </CardContent>
      <CardFooter className="pt-2">
        <span
          className={`text-xs ${trend > 0 ? "text-green-600" : "text-red-600"}`}
        >
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% from last week
        </span>
      </CardFooter>
    </Card>
  </motion.div>
);

const ChartCard: React.FC<ChartCardProps> = ({ data }) => (
  <motion.div variants={itemVariants}>
    <Card className="col-span-2 shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-md font-semibold text-gray-800">
          Weekly Applicant Overview
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          Inbound vs AI-Recommended Applicants
        </CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" stroke="#4b5563" />
            <YAxis stroke="#4b5563" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="inboundApplicants"
              stroke="#6b7280"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="aiRecommended"
              stroke="#9ca3af"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </motion.div>
);

const EmployerDashboardOverviewStats: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");

  useEffect(() => {
    const fetchMessage = async () => {
      // Simulating an async call to get the welcome message
      const message = "Welcome back! Here's your dashboard overview.";
      setWelcomeMessage(message);
    };

    fetchMessage();
  }, []);

  return (
    <motion.div
      className="space-y-6 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className="text-xl font-bold text-gray-900 mb-8" variants={itemVariants}>
        Welcome back, Employer
      </motion.h1>

      <motion.div variants={itemVariants}>
        <Card className="w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <BotIcon className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{welcomeMessage}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
        <StatCard
          title="Inbound Applicants"
          value={142}
          icon={Users}
          description="Total applicants this week"
          trend={12}
        />
        <StatCard
          title="AI Recommendations"
          value={60}
          icon={UserPlus}
          description="AI-matched candidates"
          trend={8}
        />
        <StatCard
          title="Conversion Rate"
          value="18%"
          icon={TrendingUp}
          description="Applicants to interviews"
          trend={-2}
        />
        <StatCard
          title="Active Jobs"
          value={7}
          icon={Briefcase}
          description="Open positions"
          trend={0}
        />
      </div>

      <ChartCard data={mockData} />

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-md font-semibold text-gray-800">
                Additional Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Here you can add more detailed statistics, charts, or tables as needed.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 text-xs"
        >
          {isExpanded ? "Show Less" : "Show More"}{" "}
          <ChevronRight
            className={`ml-2 ${isExpanded ? "rotate-90" : ""} h-4 w-4`}
          />
        </Button>
      </div>
    </motion.div>
  );
};

export default EmployerDashboardOverviewStats;