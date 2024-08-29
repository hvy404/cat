import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  UserPlus,
  Award,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { getAIRecommendationDetails } from "@/lib/employer/get-match-detailed-info";
import { getAIRecommendationGraphDetails } from "@/lib/employer/get-match-neo-details";

interface AIRecommendationDetailProps {
  recommendationId: string;
  onBack: () => void;
}

const AIRecommendationDetailPanel: React.FC<AIRecommendationDetailProps> = ({
  recommendationId,
  onBack,
}) => {
  const [recommendationData, setRecommendationData] = useState<any>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendationDetails = async () => {
      setLoading(true);
      try {
        const result = await getAIRecommendationDetails(recommendationId);
        if (result.success && result.data) {
          setRecommendationData(result.data);
          
          // Call getAIRecommendationGraphDetails after setting recommendationData
          const graphResult = await getAIRecommendationGraphDetails(
            result.data.job_id,
            result.data.candidate_id
          );
          if (graphResult.success) {
            setGraphData(graphResult.data);
          } else {
            console.error("Error fetching graph details:", graphResult.error);
          }
        } else {
          setError("There was an error fetching details");
        }
      } catch (err) {
        setError("Failed to fetch recommendation details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };    

    fetchRecommendationDetails();
  }, [recommendationId]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
          <Skeleton className="h-4 w-4/6" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="sticky top-0 bg-white border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            AI Recommendation
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 py-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-gray-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {recommendationData.candidateName}
            </h2>
            <p className="text-sm text-gray-500">
              {recommendationData.jobTitle}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Match Score</span>
            <span className="text-lg font-semibold">
              {recommendationData.matchScore}%
            </span>
          </div>
          <Progress value={recommendationData.matchScore} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2 mb-1">
                <Award className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-medium">Experience</h3>
              </div>
              <p className="text-sm">{recommendationData.experience}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2 mb-1">
                <GraduationCap className="h-4 w-4 text-green-500" />
                <h3 className="text-sm font-medium">Education</h3>
              </div>
              <p className="text-sm">{recommendationData.education}</p>
            </CardContent>
          </Card>
        </div>

        {recommendationData.detailedEvaluation?.areasForDevelopment &&
          recommendationData.detailedEvaluation.areasForDevelopment.length >
            0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Areas for Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <ul className="text-sm text-gray-700 list-disc pl-4">
                    {recommendationData.detailedEvaluation.areasForDevelopment.map(
                      (area: string, index: number) => (
                        <li key={index}>{area}</li>
                      )
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
      </CardContent>
      <CardFooter className="sticky bottom-0 bg-white">
        <div className="w-full flex space-x-3">
          <Button className="flex-1" variant="outline" size="sm">
            Save for Later
          </Button>
          <Button className="flex-1" size="sm">
            Contact Candidate
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AIRecommendationDetailPanel;
