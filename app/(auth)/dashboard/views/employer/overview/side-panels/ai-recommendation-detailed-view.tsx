import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  UserPlus,
  TrendingUp,
  Lightbulb,
  Circle,
  AlertTriangle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getAIRecommendationDetails } from "@/lib/employer/get-match-detailed-info";
import { getAIRecommendationGraphDetails } from "@/lib/employer/get-match-neo-details";
import { downloadCandidateResume } from "@/lib/employer/download-resume";
import ResumeDownloadDialog from "@/app/(auth)/dashboard/views/employer/overview/mods/request-resume";
import { CandidateContactDialog } from "@/app/(auth)/dashboard/views/employer/overview/mods/request-contact";
import { InviteUserDialog } from "@/app/(auth)/dashboard/views/employer/overview/mods/match-send-invite";
import {
  updateMatchStatus,
  MatchStatus,
} from "@/lib/employer/update-match-status";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { sendResumeViewAlertAction } from "@/lib/employer/send-resume-view-alert";

interface AIRecommendationDetailProps {
  recommendationId: string;
  status: RecommendationStatus | null;
  onBack: () => void;
}

type RecommendationStatus =
  | "new"
  | "reviewed"
  | "contacted"
  | "rejected"
  | "all";

const AIRecommendationDetailPanel: React.FC<AIRecommendationDetailProps> = ({
  recommendationId,
  status,
  onBack,
}) => {
  const [recommendationData, setRecommendationData] = useState<any>(null);
  const [currentStatus, setCurrentStatus] = useState<MatchStatus>(
    status as MatchStatus
  );
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<MatchStatus | null>(null);

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

  const handleStatusChange = (newStatus: MatchStatus) => {
    setPendingStatus(newStatus);
    setIsAlertOpen(true);
  };

  const confirmStatusChange = async () => {
    if (pendingStatus) {
      try {
        await updateMatchStatus(recommendationId, pendingStatus);
        setCurrentStatus(pendingStatus);
        toast.success(`Status updated to ${pendingStatus}`);
      } catch (error) {
        toast.error("Failed to update status");
      }
    }
    setIsAlertOpen(false);
  };

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
              {(graphData?.candidateInfo.city ||
                graphData?.candidateInfo.state ||
                graphData?.candidateInfo.zipcode) && (
                <p className="text-xs text-gray-400 mt-1">
                  <span className="font-medium">Location: </span>
                  {[
                    graphData.candidateInfo.city,
                    graphData.candidateInfo.state,
                    graphData.candidateInfo.zipcode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={currentStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[140px] h-9 px-3 py-2 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {renderMatchScore(recommendationData.matchScore)}
          </div>
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
          <div>
            <p className="text-sm text-gray-900">
              {graphData?.jobInfo.description}
            </p>
          </div>,
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
          <ResumeDownloadDialog
            onDownload={async (sendEmail) => {
              const url = await downloadCandidateResume(
                recommendationData.candidate_id
              );
              if (url) {
                window.open(url, "_blank");
                if (sendEmail) {
                  sendResumeViewAlertAction({
                    candidateName: recommendationData.candidateName,
                    jobId: recommendationData.job_id,
                    candidateEmail: recommendationData.candidateEmail,
                    jobTitle: recommendationData.jobTitle,
                  });
                }
              }
            }}
          />
          <CandidateContactDialog candidateInfo={graphData.candidateInfo} />
          <InviteUserDialog
            candidateId={recommendationData.candidate_id}
            jobId={recommendationData.job_id}
            matchId={recommendationId}
          />
        </div>
      </CardFooter>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status to {pendingStatus}?
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-sm font-medium text-green-800">
                    Note
                  </span>
                </div>
                <p className="mt-2 text-sm text-green-700">
                  Changing the status is for your notes only. The candidate will
                  not see this status change.
                </p>
              </div>
              {pendingStatus === "rejected" && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-sm font-medium text-red-800">
                      Important Note
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-red-700">
                    Changing the status to "rejected" will hide this match from
                    your list.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AIRecommendationDetailPanel;
