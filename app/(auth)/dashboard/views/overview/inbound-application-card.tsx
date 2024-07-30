import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { getEmployerJobApplications } from "@/lib/employer/recent-applicants";
import useStore from "@/app/state/useStore";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const InboundApplicantsCard: React.FC = () => {
  const [applicantCount, setApplicantCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState<number | null>(null);
  const { user, setEmployerRightPanelView } = useStore();

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.uuid) return;

      setIsLoading(true);
      try {
        const applications = await getEmployerJobApplications(user.uuid);
        if (applications) {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

          const recentApplications = applications.filter(
            (app) => new Date(app.submissionDate) >= oneWeekAgo
          );

          setApplicantCount(recentApplications.length);

          const previousWeekCount = applications.filter(
            (app) =>
              new Date(app.submissionDate) >=
                new Date(oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000) &&
              new Date(app.submissionDate) < oneWeekAgo
          ).length;

          if (previousWeekCount > 0 || recentApplications.length > 0) {
            const trendPercentage =
              previousWeekCount !== 0
                ? Math.round(
                    ((recentApplications.length - previousWeekCount) /
                      previousWeekCount) *
                      100
                  )
                : 0;
            setTrend(trendPercentage);
          } else {
            setTrend(null);
          }
        }
      } catch (err) {
        setError("Failed to fetch applicant data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const handleCardClick = () => {
    setEmployerRightPanelView('inboundApplications');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </>
      );
    }

    if (error) {
      return (
        <>
          <div className="text-2xl font-bold text-gray-900">Error</div>
          <p className="text-sm text-gray-500 h-8 flex items-center">{error}</p>
        </>
      );
    }

    return (
      <>
        <div className="text-2xl font-bold text-gray-900">{applicantCount}</div>
        <p className="text-sm text-gray-500 h-8 flex items-center">
          Total applicants this week
        </p>
      </>
    );
  };

  return (
    <Card 
      className="w-full h-full bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center h-8">
          <Users className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
          <span className="line-clamp-2">Inbound Applicants</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {renderContent()}
      </CardContent>
      <CardFooter className="pt-2">
        {!isLoading && !error && trend !== null && (
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
        )}
        {isLoading && <Skeleton className="h-4 w-24" />}
      </CardFooter>
    </Card>
  );
};

export default InboundApplicantsCard;