import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "@/app/state/useStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, FileText, UserPlus, Award, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickStats } from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/quick-stats";
import {
  InsightsCard,
  CareerInsight,
} from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/career-insight";
import { JobCard } from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/job-card";
import { RecommendationCard } from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/recommendation-card";

interface Job {
  id: number;
  title: string;
  company: string;
  salary?: string;
  match?: number;
  status?: string;
  progress?: number;
}

interface DashboardData {
  invitedJobs: Job[];
  appliedJobs: Job[];
  resumeRecommendations: string[];
  profileEnhancements: string[];
  careerInsights: CareerInsight[];
}

const mockData: DashboardData = {
  invitedJobs: [
    {
      id: 1,
      title: "Senior React Developer",
      company: "Acme",
      salary: "$120k - $150k",
      match: 95,
    },
    {
      id: 2,
      title: "Full Stack Engineer",
      company: "Corp",
      salary: "$100k - $130k",
      match: 88,
    },
  ],
  appliedJobs: [
    {
      id: 3,
      title: "Frontend Developer",
      company: "Batman",
    },
    {
      id: 4,
      title: "Software Architect",
      company: "Spidey",
    },
  ],
  resumeRecommendations: [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    "Add more details about your role in Agile development processes",
    "Include metrics demonstrating the impact of your work",
  ],
  profileEnhancements: [
    'Complete the "Skills" section of your profile',
    "Request endorsements from previous colleagues",
  ],
  careerInsights: [
    { date: "Jan", applications: 5, interviews: 2 },
    { date: "Feb", applications: 8, interviews: 3 },
    { date: "Mar", applications: 12, interviews: 5 },
    { date: "Apr", applications: 15, interviews: 7 },
    { date: "May", applications: 10, interviews: 4 },
  ],
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};


export function CandidateDashboard() {
  const { candidateDashboard, setCandidateDashboard, user } = useStore();
  const candidateId = user?.uuid;

  const [data, setData] = useState<DashboardData>(mockData);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshData = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
        <Button
          onClick={refreshData}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          <RefreshCw
            className={`w-3 h-3 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <QuickStats />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="jobs" className="text-sm">
            Jobs
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-sm">
            Insights
          </TabsTrigger>
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
                  <div
                    className="grid grid-cols-1 gap-4 flex-grow"
                    style={{
                      gridTemplateRows: "repeat(auto-fit, minmax(0, 1fr))",
                    }}
                  >
                    {data.invitedJobs.map((job) => (
                      <JobCard key={job.id} job={job} type="invited" />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col">
                  <h2 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-700" />
                    Jobs You've Applied To
                  </h2>
                  <div
                    className="grid grid-cols-1 gap-4 flex-grow"
                    style={{
                      gridTemplateRows: "repeat(auto-fit, minmax(0, 1fr))",
                    }}
                  >
                    {data.appliedJobs.map((job) => (
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
            <p className="text-sm text-gray-700">
              Advanced job search and filtering options (to be implemented)
            </p>
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
