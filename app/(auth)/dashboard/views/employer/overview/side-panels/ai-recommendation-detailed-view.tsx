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
  TrendingUp,
  Lightbulb,
  Circle,
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

  const renderMatchScore = (score: number) => {
    const getCircleClass = (threshold: number, partialThreshold: number) => {
      if (score > threshold) return "fill-blue-500 text-blue-500";
      if (score > partialThreshold)
        return "fill-blue-500 text-blue-500 half-filled";
      return "text-gray-300";
    };

    return (
      <div className="flex space-x-1">
        <Circle className={`h-4 w-4 ${getCircleClass(0.15, 0)}`} />
        <Circle className={`h-4 w-4 ${getCircleClass(0.35, 0.25)}`} />
        <Circle className={`h-4 w-4 ${getCircleClass(0.5, 0.35)}`} />
        <Circle className={`h-4 w-4 ${getCircleClass(0.65, 0.5)}`} />
      </div>
    );
  };

  const renderSection = (
    title: string,
    content: React.ReactNode,
    isColored: boolean
  ) => (
    <div className={`p-4 rounded-lg ${isColored ? "bg-gray-50" : "bg-white"}`}>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {content}
    </div>
  );

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
      <CardHeader className="sticky top-0 bg-white border-b px-6 py-3">
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
      <CardContent className="space-y-6 py-4">
        <div className="flex items-center justify-between space-x-4">
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
          {renderMatchScore(recommendationData.matchScore)}
        </div>

        {renderSection(
          "Analyst Notes",
          <div className="flex space-x-6">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <h3 className="text-sm font-medium">Recommendation</h3>
              </div>
              <p className="text-sm">
                {recommendationData.detailedEvaluation.recommendation}
              </p>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <h3 className="text-sm font-medium">Areas for Development</h3>
              </div>
              <ul className="text-sm text-gray-700 list-disc pl-4">
                {recommendationData.detailedEvaluation.areasForDevelopment.map(
                  (area: string, index: number) => (
                    <li key={index}>{area}</li>
                  )
                )}
              </ul>
            </div>
          </div>,
          false
        )}

        {renderSection(
          "Job Details",
          <p className="text-sm">{graphData?.jobInfo.description}</p>,
          true
        )}

        {renderSection(
          "Skills",
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Candidate</h4>
              <ul className="list-disc pl-5 space-y-2">
                {graphData?.comparisonData.skills.candidate.map(
                  (skill: any, index: number) => (
                    <li key={index} className="text-sm ml-2 break-words">
                      {skill.name}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Job Requirements</h4>
              <ul className="list-disc pl-5 space-y-2">
                {graphData?.comparisonData.skills.jobRequired.map(
                  (skill: any, index: number) => (
                    <li key={index} className="text-sm ml-2 break-words">
                      {skill.name}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>,
          false
        )}

        {renderSection(
          "Experience",
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">
                Candidate Experience
              </h3>
              {graphData?.comparisonData.experience.candidate.map(
                (exp: any, index: number) => (
                  <div key={index} className="mb-2">
                    <p className="text-sm font-medium">
                      {exp.job_title} at {exp.organization}
                    </p>
                    <p className="text-xs text-gray-500">
                      {exp.start_date} - {exp.end_date}
                    </p>
                  </div>
                )
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Job Requirement</h3>
              <p className="text-sm">
                {graphData?.comparisonData.experience.jobRequired}
              </p>
            </div>
          </div>,
          true
        )}

        {renderSection(
          "Education",
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">
                Candidate Education
              </h3>
              {graphData?.comparisonData.education.candidate.map(
                (edu: any, index: number) => (
                  <div key={index} className="mb-2">
                    <p className="text-sm font-medium">{edu.degree}</p>
                    <p className="text-xs text-gray-500">{edu.institution}</p>
                  </div>
                )
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Job Requirement</h3>
              <ul className="list-disc pl-4 text-sm">
                {graphData?.comparisonData.education.jobRequired.map(
                  (req: string[], index: number) => (
                    <li key={index}>{req.join(", ")}</li>
                  )
                )}
              </ul>
            </div>
          </div>,
          false
        )}

        {renderSection(
          "Certifications",
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Candidate</h4>
              <ul className="list-disc pl-5 space-y-2">
                {graphData?.comparisonData.certifications.candidate.map(
                  (cert: any, index: number) => (
                    <li key={index} className="text-sm ml-2 break-words">
                      {cert.name}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Job Requirements</h4>
              <ul className="list-disc pl-5 space-y-2">
                {graphData?.comparisonData.certifications.jobRequired.map(
                  (cert: any, index: number) => (
                    <li key={index} className="text-sm ml-2 break-words">
                      {cert.name}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>,
          true
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