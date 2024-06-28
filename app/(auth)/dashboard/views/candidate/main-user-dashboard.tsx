import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from "@/app/state/useStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Briefcase, FileText, UserPlus, Award, RefreshCw, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Job {
  id: number;
  title: string;
  company: string;
  salary?: string;
  match?: number;
  status?: string;
  progress?: number;
}

interface CareerInsight {
  date: string;
  applications: number;
  interviews: number;
}

interface DashboardData {
  invitedJobs: Job[];
  appliedJobs: Job[];
  resumeRecommendations: string[];
  profileEnhancements: string[];
  careerInsights: CareerInsight[];
}

interface QuickStat {
  icon: React.ElementType;
  title: string;
  value: string;
  change: string;
}

const mockData: DashboardData = {
  invitedJobs: [
    { id: 1, title: 'Senior React Developer', company: 'Acme', salary: '$120k - $150k', match: 95 },
    { id: 2, title: 'Full Stack Engineer', company: 'Corp', salary: '$100k - $130k', match: 88 },
  ],
  appliedJobs: [
    { id: 3, title: 'Frontend Developer', company: 'Batman', status: 'In Review', progress: 60 },
    { id: 4, title: 'Software Architect', company: 'Spidey', status: 'Interview Scheduled', progress: 80 },
  ],
  resumeRecommendations: [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    'Add more details about your role in Agile development processes',
    'Include metrics demonstrating the impact of your work',
  ],
  profileEnhancements: [
    'Complete the "Skills" section of your profile',
    'Request endorsements from previous colleagues',
  ],
  careerInsights: [
    { date: 'Jan', applications: 5, interviews: 2 },
    { date: 'Feb', applications: 8, interviews: 3 },
    { date: 'Mar', applications: 12, interviews: 5 },
    { date: 'Apr', applications: 15, interviews: 7 },
    { date: 'May', applications: 10, interviews: 4 },
  ],
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface JobCardProps {
  job: Job;
  type: 'invited' | 'applied';
}

const JobCard: React.FC<JobCardProps> = ({ job, type }) => (
  <Card className="w-full bg-white shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-gray-300 flex flex-col h-full">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <CardTitle className="text-md font-semibold text-gray-800">{job.title}</CardTitle>
        {type === 'invited' && job.match && (
          <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
            {job.match}% Match
          </span>
        )}
      </div>
      <CardDescription className="text-sm text-gray-600">{job.company}</CardDescription>
    </CardHeader>
    <CardContent className="py-2 flex-grow">
      <p className="text-sm text-gray-700">
        {type === 'invited' ? job.salary : (
          <div className="flex items-center">
            <span className="mr-2">{job.status}</span>
            {job.progress && <Progress value={job.progress} className="w-24" />}
          </div>
        )}
      </p>
    </CardContent>
    <CardFooter className="pt-2 flex justify-end">
      <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
        View Details <ChevronRight className="ml-1 w-4 h-4" />
      </Button>
    </CardFooter>
  </Card>
);

interface RecommendationCardProps {
  title: string;
  items: string[];
  icon: React.ElementType;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ title, items, icon: Icon }) => (
  <Card className="w-full bg-white shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
    <CardHeader className="flex flex-row items-center space-x-2 pb-2">
      <Icon className="w-4 h-4 text-gray-700" />
      <CardTitle className="text-md font-semibold text-gray-800">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex-grow">
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-gray-700 flex items-start">
            <span className="w-1 h-1 rounded-full bg-gray-500 mr-2 mt-1.5 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter className="pt-2 mt-auto">
      <Button variant="outline" size="sm" className="w-full text-sm">
        Take Action
      </Button>
    </CardFooter>
  </Card>
);

interface InsightsCardProps {
  data: CareerInsight[];
}

const InsightsCard: React.FC<InsightsCardProps> = ({ data }) => (
  <Card className="w-full bg-white shadow-sm hover:shadow-md transition-all duration-300">
    <CardHeader>
      <CardTitle className="text-sm font-semibold text-gray-800">Career Insights</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#4B5563" />
          <YAxis stroke="#4B5563" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#FFFFFF', border: 'none' }}
            itemStyle={{ color: '#1F2937' }}
          />
          <Line type="monotone" dataKey="applications" stroke="#4B5563" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="interviews" stroke="#9CA3AF" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const QuickStats: React.FC = () => {
  const stats: QuickStat[] = [
    { icon: TrendingUp, title: "Profile Views", value: "152", change: "+12%" },
    { icon: DollarSign, title: "Avg. Salary Range", value: "$110k - $140k", change: "+5%" },
    { icon: Clock, title: "Time to Interview", value: "14 days", change: "-2 days" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <stat.icon className="w-6 h-6 text-gray-600 mb-2" />
            <p className="text-sm font-medium text-gray-700">{stat.title}</p>
            <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export function CandidateDashboard() {
  const { candidateDashboard, setCandidateDashboard, user } = useStore();
  const candidateId = user?.uuid;

  const [data, setData] = useState<DashboardData>(mockData);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshData = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setData(mockData);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [candidateId]);

  return (
    <div className="max-w">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-gray-900">Welcome back, Huy</h1>
        <Button onClick={refreshData} disabled={isLoading} variant="outline" size="sm" className="text-xs">
          <RefreshCw className={`w-3 h-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <QuickStats />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
          <TabsTrigger value="jobs" className="text-sm">Jobs</TabsTrigger>
          <TabsTrigger value="insights" className="text-sm">Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              <motion.div
                key="job-sections"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.5, delay: 0.1 }}
                className="col-span-1 lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <div className="flex flex-col">
                  <h2 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-gray-700" />
                    Jobs You're Invited To
                  </h2>
                  <div className="grid grid-cols-1 gap-4 flex-grow" style={{ gridTemplateRows: 'repeat(auto-fit, minmax(0, 1fr))' }}>
                    {data.invitedJobs.map(job => (
                      <JobCard key={job.id} job={job} type="invited" />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col">
                  <h2 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-700" />
                    Jobs You've Applied To
                  </h2>
                  <div className="grid grid-cols-1 gap-4 flex-grow" style={{ gridTemplateRows: 'repeat(auto-fit, minmax(0, 1fr))' }}>
                    {data.appliedJobs.map(job => (
                      <JobCard key={job.id} job={job} type="applied" />
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                key="resume-recommendations"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col h-full"
              >
                <RecommendationCard
                  title="Resume Recommendations"
                  items={data.resumeRecommendations}
                  icon={Award}
                />
              </motion.div>

              <motion.div
                key="profile-enhancements"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col h-full"
              >
                <RecommendationCard
                  title="Profile Enhancements"
                  items={data.profileEnhancements}
                  icon={UserPlus}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </TabsContent>
        <TabsContent value="jobs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <p className="text-sm text-gray-700">Advanced job search and filtering options (to be implemented)</p>
          </div>
        </TabsContent>
        <TabsContent value="insights">
          <InsightsCard data={data.careerInsights} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CandidateDashboard;