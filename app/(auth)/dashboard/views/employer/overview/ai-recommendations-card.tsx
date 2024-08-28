import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";
import { getAIRecommendations } from "@/lib/employer/ai-match-count";
import useStore from "@/app/state/useStore";

const AIRecommendationsCard: React.FC = () => {
  const { user: clerkUser } = useUser();
  const [recommendationCount, setRecommendationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState<number | null>(null);
  const { setEmployerRightPanelView, setAiRecommendations } = useStore();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!clerkUser) return;

      const employerId = clerkUser.publicMetadata.aiq_cuid as string;

      try {
        const { count, recommendations } = await getAIRecommendations(employerId);
        setRecommendationCount(count); // TODO: Deprecate and use Zustand
        setAiRecommendations(recommendations);

        // You might want to implement trend calculation here
        setTrend(15); // Placeholder value TODO: Remove
      } catch (err) {
        setError("Failed to fetch AI recommendations");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [clerkUser]);

  const handleCardClick = () => {
    setEmployerRightPanelView("aiRecommendations");
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
        <div className="text-2xl font-bold text-gray-900">
          {recommendationCount}
        </div>
        <p className="text-sm text-gray-500 h-8 flex items-center">
          AI-matched candidates this week
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
          <UserPlus className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
          <span className="line-clamp-2">AI Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">{renderContent()}</CardContent>
      <CardContent className="pt-2">
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
            {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} {Math.abs(trend)}% from
            last week
          </span>
        )}
        {isLoading && <Skeleton className="h-4 w-24" />}
      </CardContent>
    </Card>
  );
};

export default AIRecommendationsCard;
