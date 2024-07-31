import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import useStore from "@/app/state/useStore";

const AIRecommendationsCard: React.FC = () => {
  const [recommendationCount, setRecommendationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState<number | null>(null);
  const { setEmployerRightPanelView } = useStore();

  useEffect(() => {
    // Simulating an API call
    setTimeout(() => {
      setRecommendationCount(42);
      setTrend(15);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCardClick = () => {
    setEmployerRightPanelView('aiRecommendations');
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
        <div className="text-2xl font-bold text-gray-900">{recommendationCount}</div>
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
      <CardContent className="space-y-2">
        {renderContent()}
      </CardContent>
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
            {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} {Math.abs(trend)}% from last
            week
          </span>
        )}
        {isLoading && <Skeleton className="h-4 w-24" />}
      </CardContent>
    </Card>
  );
};

export default AIRecommendationsCard;
