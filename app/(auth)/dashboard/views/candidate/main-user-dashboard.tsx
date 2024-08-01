import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "@/app/state/useStore";
import {
  InsightsCard,
  CareerInsight,
} from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/career-insight";
import ProfileSuggestionCard from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/profile-suggestions";
import { Suggestion as ProfileSuggestion } from "@/lib/dashboard/candidate/profile-enhancements/build-suggestions";
import ResumeSuggestionCard from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/resume-suggestions";
import { ResumeSuggestion } from "@/lib/dashboard/candidate/resume-enhancements/build-suggestions";
import JobInvited from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/job-invited";
import {
  getAllBookmarkedJobsForCandidate,
  CandidateJobBookmark,
} from "@/app/(auth)/dashboard/views/candidate/search/bookmark";
import { JobBookmarked } from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/job-bookmarked";
import TalentId from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/talent-id";
import CandidateAlertsCard from "@/app/(auth)/dashboard/views/candidate/main-candidate-alerts";
import ProfilePictureUpload from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/profile-picture";

interface Job {
  id: number;
  title: string;
  company: string;
  salary?: string;
  match?: number;
  status?: string;
  progress?: number;
  inviteDate: string;
}

interface DashboardData {
  appliedJobs: Job[];
  bookmarkedJobs: CandidateJobBookmark[];
  careerInsights: CareerInsight[];
  invitedJobs: Job[];
}

const mockData: DashboardData = {
  appliedJobs: [],
  bookmarkedJobs: [],
  invitedJobs: [],
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
  const { user: clerkUser } = useUser();
  const { setCandidateDashboard, setSelectedMenuItem } = useStore((state) => ({
    setCandidateDashboard: state.setCandidateDashboard,
    setSelectedMenuItem: state.setSelectedMenuItem,
  }));

  const [data, setData] = useState<DashboardData>(mockData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<CandidateJobBookmark[]>(
    []
  );

  const candidateId = clerkUser?.publicMetadata?.cuid as string;

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

  const handleViewMoreJobBookmarked = useCallback(
    (jobId: string) => {
      setCandidateDashboard({
        widget: "jobBookmarked",
        widgetPayload: { type: "jobBookmarked", payload: { jobId: jobId } },
      });
    },
    [setCandidateDashboard]
  );

  const handleBookmarkRemoved = useCallback((jobId: string) => {
    console.log("Bookmark removed for job:", jobId);
    setBookmarkedJobs((prevJobs) =>
      prevJobs.filter((job) => job.jd_id !== jobId)
    );
  }, []);

  const handleBrowseJobsClick = useCallback(() => {
    setSelectedMenuItem("talent-search");
  }, [setSelectedMenuItem]);

  // Bookmark view details
  const handleViewMoreJobInvited = useCallback(
    (jobId: string) => {
      setCandidateDashboard({
        widget: "inviteAlerts",
        widgetPayload: { type: "inviteAlerts", payload: { jobId: jobId } },
      });
    },
    [setCandidateDashboard]
  );

  // Handle view details action
  const handleAlertAction = useCallback(
    (alertType: string, jobId: string) => {
      switch (alertType) {
        case "invite":
          setCandidateDashboard({
            widget: "inviteAlerts",
            widgetPayload: { type: "inviteAlerts", payload: { jobId: jobId } },
          });
          break;
        /* case "match":
          setCandidateDashboard({
            widget: "matchAlerts",
            widgetPayload: { type: "matchAlerts", payload: { jobId: jobId } },
          });
          break; */
        default:
          console.warn(`Unhandled alert type: ${alertType}`);
      }
    },
    [setCandidateDashboard]
  );

  const handleTalentIDLearnMore = useCallback(
    (candidateId: string) => {
      setCandidateDashboard({
        widget: "talentID",
        widgetPayload: {
          type: "talentID",
          payload: { show: true, candidateId },
        },
      });
      console.log("Talent ID learn more");
    },
    [setCandidateDashboard]
  );

  const handleResumeSuggestionClick = useCallback(
    (suggestion: ResumeSuggestion) => {
      setCandidateDashboard({
        widget: "resumeRecommendation",
        widgetPayload: {
          type: "resumeRecommendation",
          payload: {
            message: suggestion.message,
            title: suggestion.title,
            priority: suggestion.priority,
            type: suggestion.type,
          },
        },
      });
    },
    [setCandidateDashboard]
  );

  const handleProfileSuggestionClick = useCallback(
    (suggestion: ProfileSuggestion) => {
      setCandidateDashboard({
        widget: "profileRecommendation",
        widgetPayload: {
          type: "profileRecommendation",
          payload: {
            message: suggestion.message,
            title: suggestion.title,
            priority: suggestion.priority,
            type: suggestion.type,
          },
        },
      });
    },
    [setCandidateDashboard]
  );

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const memoizedJobBookmarked = useMemo(
    () => (
      <JobBookmarked
        bookmarkedJobs={bookmarkedJobs}
        handleViewMoreJobBookmarked={handleViewMoreJobBookmarked}
        candidateId={candidateId}
        onBookmarkRemoved={handleBookmarkRemoved}
        handleBrowseJobsClick={handleBrowseJobsClick}
      />
    ),
    [
      bookmarkedJobs,
      handleViewMoreJobBookmarked,
      candidateId,
      handleBookmarkRemoved,
      handleBrowseJobsClick,
    ]
  );

  const memoizedJobInvited = useMemo(
    () => <JobInvited handleViewMoreJobInvited={handleViewMoreJobInvited} />,
    [handleViewMoreJobInvited]
  );

  const memoizedInsightsCard = useMemo(
    () => <InsightsCard data={data.careerInsights} />,
    [data.careerInsights]
  );

  if (!candidateId) return <p>Loading...</p>;

  return (
    <div className="max-w">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-gray-900">Welcome back!</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ProfilePictureUpload userId={candidateId} />

        <CandidateAlertsCard onAlertAction={handleAlertAction} />
        <TalentId
          handleTalentIDLearnMore={handleTalentIDLearnMore}
          candidateId={candidateId}
        />
      </div>

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
            <div className="flex flex-col h-full">{memoizedJobBookmarked}</div>
            <div className="flex flex-col h-full">{memoizedJobInvited}</div>
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
            <ResumeSuggestionCard
              candidateId={candidateId}
              handleResumeSuggestionClick={handleResumeSuggestionClick}
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
            <ProfileSuggestionCard
              candidateId={candidateId}
              handleProfileSuggestionClick={handleProfileSuggestionClick}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default React.memo(CandidateDashboard);
