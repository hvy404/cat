import useStore from "@/app/state/useStore";
import { useState, useEffect } from "react";
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
  BotIcon,
  Archive,
  MapPin,
  Calendar,
  FilePlus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchDetailedJobPosts } from "@/lib/overview/fetchRoles";

interface Job {
  jd_id: string;
  title: string;
  location: any[];
  location_type: string;
  security_clearance: string;
  posted_date: string;
  private_employer: boolean | null;
  new_match?: boolean;
}

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
      staggerChildren: 0.1,
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
        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center h-8">
          <Icon className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
          <span className="line-clamp-2">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <p className="text-sm text-gray-500 h-8 flex items-center">
          {description}
        </p>
      </CardContent>
      <CardFooter className="pt-2">
        <span
          className={`text-xs ${
            trend > 0
              ? "text-gray-700"
              : trend < 0
              ? "text-gray-500"
              : "text-gray-400"
          }`}
        >
          {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} {Math.abs(trend)}% from last
          week
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
        <CardDescription className="text-xs text-gray-500">
          Inbound vs AI-Recommended Applicants
        </CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
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
              stroke="#d1d5db"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </motion.div>
);

const JobList = ({ filter }: { filter: string }) => {
  const { setDashboardRoleOverview, dashboard_role_overview, user } =
    useStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(true);
  const [noJobs, setNoJobs] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchJobs = async () => {
      if (user) {
        const result = await fetchDetailedJobPosts(user.uuid, filter);
        if (isMounted) {
          setLoadingJobs(false);
          if (result && Array.isArray(result.data) && result.data.length > 0) {
            setJobs(result.data);
          } else {
            setNoJobs(true);
          }
        }
      }
    };

    fetchJobs();
    return () => {
      isMounted = false;
    };
  }, [user, filter]);

  const handleClick = (job_id: string, title: string) => {
    setDashboardRoleOverview({
      active: true,
      active_role_id: String(job_id),
      active_role_name: title,
    });
  };

  if (loadingJobs) return <JobListSkeleton />;
  if (noJobs) return <NoJobsFound />;

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <motion.div
          key={job.jd_id}
          className={`rounded-md transition-all duration-300 cursor-pointer ${
            dashboard_role_overview.active_role_id === job.jd_id
              ? "bg-gray-100/70"
              : ""
          }`}
          onClick={() => handleClick(job.jd_id, job.title)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="px-4 py-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 mt-2">
              {job.title}
            </h3>
            <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-2">
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {job.location_type}
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                Posted: {job.posted_date}
              </div>
            </div>
            {/* <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" className="text-primary">
                View Applicants
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              {job.new_match && (
                <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                  New Match
                </span>
              )}
            </div> */}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const JobListSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white p-4 sm:p-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-8 w-32" />
      </div>
    ))}
  </div>
);

const NoJobsFound = () => (
  <div className="py-8">
    <p className="text-center text-sm text-gray-500">
      You haven't added any job opportunities yet.
    </p>
    <Button variant="outline" className="mt-4 mx-auto block">
      Add Your First Job
    </Button>
  </div>
);

const EmployerDashboardView: React.FC = () => {
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
    <div className="min-h-screen w-full">
      <main>
        <motion.div
          className="space-y-6 mb-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <BotIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {welcomeMessage}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>
          <ChartCard data={mockData} />

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-md font-semibold text-gray-800 flex items-center">
                  <FilePlus className="w-5 h-5 mr-2" />
                  Jobs You've Posted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <JobList filter="active" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-md font-semibold text-gray-800 flex items-center">
                  <Archive className="w-5 h-5 mr-2" />
                  Archived Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <JobList filter="archived" />
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default EmployerDashboardView;
