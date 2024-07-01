import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { RecommendationCard } from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/recommendation-card";
import { JobApplied } from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/job-applied";
import { JobInvited } from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/job-invited";
import { getAllBookmarkedJobsForCandidate, CandidateJobBookmark } from "@/app/(auth)/dashboard/views/candidate/search/bookmark"; // Get bookmarked jobs
import { JobBookmarked } from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/job-bookmarked";

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
  appliedJobs: [],
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
  const { setCandidateDashboard, user } = useStore(state => ({
    setCandidateDashboard: state.setCandidateDashboard,
    user: state.user
  }));
  const candidateId = user?.uuid;

  const [data, setData] = useState<DashboardData>(mockData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<CandidateJobBookmark[]>([]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    if (candidateId) {
      const response = await getAllBookmarkedJobsForCandidate(candidateId);
      if (response.success) {
        setBookmarkedJobs(response.data || []);
      } else {
        console.error("Failed to fetch bookmarked jobs:", response.error);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setData(mockData);
    setIsLoading(false);
  }, [candidateId]);

  const handleViewMoreJobBookmarked = useCallback((jobId: string) => {
    setCandidateDashboard({
      widget: 'jobBookmarked',
      widgetPayload: { type: 'jobBookmarked', payload: { jobId: jobId } }
    });
  }, [setCandidateDashboard]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const memoizedJobBookmarked = useMemo(() => (
    <JobBookmarked 
      bookmarkedJobs={bookmarkedJobs}
      handleViewMoreJobBookmarked={handleViewMoreJobBookmarked}
    />
  ), [bookmarkedJobs, handleViewMoreJobBookmarked]);

  const memoizedJobInvited = useMemo(() => (
    <JobInvited invitedJobs={data.invitedJobs} />
  ), [data.invitedJobs]);

  const memoizedResumeRecommendations = useMemo(() => (
    <RecommendationCard
      title="Resume Recommendations"
      items={data.resumeRecommendations}
      icon={Award}
    />
  ), [data.resumeRecommendations]);

  const memoizedProfileEnhancements = useMemo(() => (
    <RecommendationCard
      title="Profile Enhancements"
      items={data.profileEnhancements}
      icon={UserPlus}
    />
  ), [data.profileEnhancements]);

  const memoizedInsightsCard = useMemo(() => (
    <InsightsCard data={data.careerInsights} />
  ), [data.careerInsights]);

  return (
    <div className="max-w">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-gray-900">Welcome back, {user?.email}</h1>
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
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="overview" className="text-sm">
            Overview
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
                <div className="flex flex-col h-full">
                  {memoizedJobBookmarked}
                </div>
                <div className="flex flex-col h-full">
                  {memoizedJobInvited}
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
                {memoizedResumeRecommendations}
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
                {memoizedProfileEnhancements}
              </motion.div>
            </AnimatePresence>
          </div>
        </TabsContent>
        <TabsContent value="insights">
          {memoizedInsightsCard}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default React.memo(CandidateDashboard);