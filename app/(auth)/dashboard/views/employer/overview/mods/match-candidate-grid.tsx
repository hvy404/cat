import { useState, useEffect } from "react";
//import AIMatchCandidateResumeView from "@/app/(auth)/dashboard/views/employer/overview/mods/match-candidate-peek";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCandidateMatchesByJob } from "@/app/(auth)/dashboard/views/employer/overview/quick-match-glance";
//import { Button } from "@/components/ui/button";
import AIRecommendationDetailPanel from "@/app/(auth)/dashboard/views/employer/overview/side-panels/ai-recommendation-detailed-view";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface CandidateMatch {
  match_id: string;
  jobId: string;
  candidateId: string;
  matchScore: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  candidateName: string;
}

type RecommendationStatus =
  | "new"
  | "reviewed"
  | "contacted"
  | "rejected"
  | "all";

export const MatchStrengthIndicator = ({ value }: { value: number }) => {
  const getColor = (value: number) => {
    if (value <= 0.2) return "bg-red-200";
    if (value <= 0.4) return "bg-yellow-200";
    if (value <= 0.6) return "bg-green-200";
    if (value <= 0.8) return "bg-blue-200";
    return "bg-indigo-200";
  };

  const size = 16 + value * 16; // Size ranges from 16px to 32px
  const colorClass = getColor(value);

  return (
    <div className="flex items-center justify-center w-6 h-6">
      <div
        className={`rounded-full ${colorClass} transition-all duration-300 ease-in-out`}
        style={{ width: `${size}px`, height: `${size}px` }}
      ></div>
    </div>
  );
};

export default function AIMatchCandidateOverview({
  activeJobId,
}: {
  activeJobId: string;
}) {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [candidates, setCandidates] = useState<CandidateMatch[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCandidateStatus, setSelectedCandidateStatus] =
    useState<RecommendationStatus | null>(null);



  function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-500';
      case 'reviewed':
        return 'bg-yellow-500';
      case 'contacted':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }
  

  useEffect(() => {
    const handleGetCandidateMatches = async () => {
      try {
        const matches = await getCandidateMatchesByJob(activeJobId);
        setCandidates(matches);
      } catch (error) {
        // Error handling can be done here if needed
      }
    };
  
    handleGetCandidateMatches();
  }, [activeJobId]);
  

  const handleOpenResume = (candidate: CandidateMatch) => {
    setSelectedCandidate(candidate.match_id);
    setSelectedCandidateStatus(candidate.status as RecommendationStatus);
    setSheetOpen(true);
  };

  return (
    <>
      {candidates.length === 0 ? (
        <Card className="mt-4 border border-gray-200 w-full">
          <CardContent className="flex flex-col items-center justify-center py-10 px-6 w-full">
            <MatchStrengthIndicator value={0.2} />
            <h3 className="text-md font-medium text-gray-800 mt-6 mb-2">
              Analyzing Talent Pool
            </h3>
            <p className="text-center text-sm text-gray-500 max-w-md">
              Our AI is currently evaluating potential candidates for your
              position. We'll notify you when we have suitable matches for your
              review.
            </p>
          </CardContent>
        </Card>
      ) : (
        candidates.map((candidate) => (
          <Card
          key={candidate.match_id}
          onClick={() => handleOpenResume(candidate)}
          className="cursor-pointer hover:shadow-md transition-shadow duration-300"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex flex-col">
              <CardTitle className="text-lg font-semibold text-gray-800">
                {candidate.candidateName}
              </CardTitle>
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(candidate.status)}`}></div>
                <span className="text-xs text-gray-600 ml-2">
                  {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                </span>
              </div>
            </div>
            <MatchStrengthIndicator value={candidate.matchScore} />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">
              Matched: {new Date(candidate.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
        
        ))
      )}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="min-w-[800px] overflow-y-auto">
          <SheetHeader className="mt-6">
            {/*             <SheetTitle className="text-sm">Candidate Details</SheetTitle> */}
            <SheetDescription>
              <AIRecommendationDetailPanel
                recommendationId={selectedCandidate || ""}
                status={selectedCandidateStatus}
                onBack={() => setSheetOpen(false)}
              />
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </>
  );
}
