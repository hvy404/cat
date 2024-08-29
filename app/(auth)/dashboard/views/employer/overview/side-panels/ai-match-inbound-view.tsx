import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  ChevronRight,
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  X,
} from "lucide-react";
import useStore from "@/app/state/useStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getAIMatches, AIMatch } from "@/lib/employer/get-match-details"; // Retreive the matches
import AIRecommendationDetailPanel from "./ai-recommendation-detailed-view"; // View details of a match

type RecommendationStatus =
  | "new"
  | "reviewed"
  | "contacted"
  | "rejected"
  | "all";

type Recommendation = {
  id: string;
  candidateName: string;
  jobTitle: string;
  matchScore: number;
  status: RecommendationStatus;
  recommendedDate: string;
};

const statusColors: Record<RecommendationStatus, string> = {
  new: "bg-green-100 text-green-800",
  reviewed: "bg-blue-100 text-blue-800",
  contacted: "bg-purple-100 text-purple-800",
  rejected: "bg-red-100 text-red-800",
  all: "",
};

const ITEMS_PER_PAGE = 10;

const AIRecommendationsSidePanel = () => {
  const { user: clerkUser } = useUser();
  const { setEmployerRightPanelView } = useStore();
  const [aiMatches, setAIMatches] = useState<AIMatch[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<
    Recommendation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RecommendationStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<
    string | null
  >(null);

  const employerId = clerkUser?.publicMetadata?.aiq_cuid as string;

  useEffect(() => {
    const fetchAIMatches = async () => {
      if (employerId) {
        setLoading(true);
        try {
          const matches = await getAIMatches(employerId);
          setAIMatches(matches);

          const newRecommendations = matches.map((match) => ({
            id: match.id,
            candidateName: match.candidate_name,
            jobTitle: match.job_title,
            matchScore: match.match_score,
            status: "new" as RecommendationStatus,
            recommendedDate: match.created_at,
          }));
          setRecommendations(newRecommendations);
        } catch (error) {
          console.error("Error fetching AI matches:", error);
          // Handle error (e.g., show error message to user)
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAIMatches();
  }, [employerId]);

  useEffect(() => {
    const filtered = recommendations.filter((rec) => {
      const nameMatch = rec.candidateName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === "all" || rec.status === statusFilter;
      return nameMatch && statusMatch;
    });
    setFilteredRecommendations(filtered);
    setCurrentPage(1);
  }, [statusFilter, recommendations, searchTerm]);

  const handleBack = () => {
    setEmployerRightPanelView("default");
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as RecommendationStatus);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const clearAllFilters = () => {
    setStatusFilter("all");
    setSearchTerm("");
  };

  const totalPages = Math.ceil(filteredRecommendations.length / ITEMS_PER_PAGE);

  const paginatedRecommendations = filteredRecommendations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleRecommendationClick = (id: string) => {
    setSelectedRecommendationId(id);
  };

  if (selectedRecommendationId) {
    return (
      <AIRecommendationDetailPanel
        recommendationId={selectedRecommendationId}
        onBack={() => setSelectedRecommendationId(null)}
      />
    );
  }

  const isFiltered = statusFilter !== "all" || searchTerm !== "";

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold flex items-center">
          <UserPlus className="mr-2 h-5 w-5" />
          AI Recommendations
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </CardHeader>
      <CardContent className="px-6 flex flex-col h-dvh">
        <div className="mb-4 space-y-2">
          <div className="flex space-x-2">
            <Select
              onValueChange={handleStatusFilterChange}
              value={statusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search by candidate name"
                className="pl-8"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          {isFiltered && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {statusFilter !== "all" && (
                  <Badge variant="secondary">
                    Status:{" "}
                    {statusFilter.charAt(0).toUpperCase() +
                      statusFilter.slice(1)}
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="secondary">Search: {searchTerm}</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-sm text-gray-500"
              >
                Clear all filters
                <X className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="text-sm text-gray-500">
            {filteredRecommendations.length} results found
          </div>
        </div>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <>
            <div className="space-y-4 overflow-y-auto flex-grow">
              {paginatedRecommendations.map((recommendation) => (
                <div
                  key={recommendation.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">
                      {recommendation.candidateName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {recommendation.jobTitle}
                    </p>
                    <p className="text-xs text-gray-400">
                      Match Score: {recommendation.matchScore}%
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${
                        statusColors[recommendation.status]
                      }`}
                    >
                      {recommendation.status.charAt(0).toUpperCase() +
                        recommendation.status.slice(1)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRecommendationClick(recommendation.id)
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecommendationsSidePanel;
