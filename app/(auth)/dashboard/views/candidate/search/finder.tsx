import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  BellOff,
  ChevronUp,
  ChevronDown,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  jobSearchHandler,
  JobSearchResult,
  SerializableJobResult,
} from "./job-search";
import {
  addCandidateJobBookmark,
  removeCandidateJobBookmark,
  checkCandidateJobBookmarkExists,
} from "@/lib/candidate/search/bookmark";
import { BuildSearchRoles } from "@/app/(auth)/dashboard/views/candidate/search/get-search-suggestions";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  createJobAlert,
  disableJobAlert,
} from "@/app/(auth)/dashboard/views/candidate/search/manage-search-alerts";
import { toast } from "sonner";
import SearchFeatureDialog from "@/app/(auth)/dashboard/views/candidate/search/info-alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import JobFilters from "@/app/(auth)/dashboard/views/candidate/search/job-filter";
import { renderJobDetails } from "@/app/(auth)/dashboard/views/candidate/search/render-job-details";

type ExtendedJobSearchResult = JobSearchResult & {
  similarJobs: SerializableJobResult[];
  match: boolean;
  socket: boolean;
  flag?: {
    threshold: number;
    mode: string;
  };
};

interface BuildSearchRolesResult {
  status: string;
  roles: string[];
  message?: string;
}

type BookmarkedJobs = { [key: string]: boolean };

interface JobSearchProps {
  viewDetails: (jobId: string) => void;
}

const card_per = 5;

export const JobSearch: React.FC<JobSearchProps> = ({ viewDetails }) => {
  const { user: clerkUser } = useUser();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] =
    useState<ExtendedJobSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<BookmarkedJobs>({});
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isSearchSuggestionsOpen, setIsSearchSuggestionsOpen] = useState(
    !hasSearched
  );
  const [filteredJobs, setFilteredJobs] = useState<SerializableJobResult[]>([]);
  const [filterChoices, setFilterChoices] = useState({
    jobType: [] as string[],
    securityClearance: [] as string[],
    locationType: [] as string[],
    compensationType: [] as string[],
    remoteFlexibility: null as boolean | null,
    salaryMin: "",
    salaryMax: "",
  });

  const candidateId = clerkUser?.publicMetadata?.aiq_cuid as string;
  const dialogDismissed =
    (clerkUser?.publicMetadata?.["3"] as string) === "true";
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(
    !dialogDismissed
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearch = async (query: string = searchQuery): Promise<void> => {
    if (!candidateId) {
      setError("User ID is not available. Please ensure you're logged in.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentPage(1);
    setHasSearched(true);
    setIsSearchSuggestionsOpen(false);

    try {
      const results = await jobSearchHandler(query, candidateId);
      setSearchResults(results as ExtendedJobSearchResult);
      setFilteredJobs((results as ExtendedJobSearchResult).similarJobs);
    } catch (err) {
      setError("There was an error during the search, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatSalary = (salary: number | null): string => {
    return salary ? `${salary.toLocaleString()}` : "Not specified";
  };

  const formatHourlyRate = (rate: number | null): string => {
    return rate ? `${rate.toFixed(2)}` : "Not specified";
  };

  const handleBookmarkToggle = async (jobId: string) => {
    if (!candidateId) {
      setError("User ID is not available. Please ensure you're logged in.");
      return;
    }

    try {
      const isCurrentlyBookmarked = bookmarkedJobs[jobId];
      if (isCurrentlyBookmarked) {
        await removeCandidateJobBookmark(candidateId, jobId);
      } else {
        await addCandidateJobBookmark(candidateId, jobId);
      }
      setBookmarkedJobs((prev) => ({
        ...prev,
        [jobId]: !isCurrentlyBookmarked,
      }));
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      setError(
        "An error occurred while updating the bookmark. Please try again."
      );
    }
  };

  useEffect(() => {
    const checkBookmarks = async () => {
      if (candidateId && searchResults?.similarJobs) {
        try {
          const newBookmarkedJobs: BookmarkedJobs = {};

          for (const job of searchResults.similarJobs) {
            const isBookmarked = await checkCandidateJobBookmarkExists(
              candidateId,
              job.job_id
            );
            newBookmarkedJobs[job.job_id] = isBookmarked;
          }

          setBookmarkedJobs(newBookmarkedJobs);
        } catch (error) {
          setError(
            "An error occurred while checking bookmarks. Please try again."
          );
        }
      }
    };
    checkBookmarks();
  }, [candidateId, searchResults]);

  const roleBuildRan = useRef(false);

  useEffect(() => {
    if (roleBuildRan.current === false && candidateId) {
      const fetchSearchSuggestions = async () => {
        try {
          const result = (await BuildSearchRoles(
            candidateId
          )) as BuildSearchRolesResult;
          if (result.status === "success") {
            setSearchSuggestions(result.roles);
          } else {
            console.error(
              "Failed to fetch search suggestions:",
              result.message
            );
          }
        } catch (error) {
          console.error("Error fetching search suggestions:", error);
        }
      };

      fetchSearchSuggestions();
      roleBuildRan.current = true;
    }

    return () => {
      roleBuildRan.current = false;
    };
  }, [candidateId]);

  const handleThumbsUp = async () => {
    if (candidateId && searchQuery) {
      const result = await createJobAlert(candidateId, searchQuery);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } else {
      toast.error("Please log in and enter a search query to create an alert.");
    }
  };

  const handleThumbsDown = async () => {
    if (candidateId && searchQuery) {
      const result = await disableJobAlert(candidateId, searchQuery);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } else {
      toast.error("Please log in and enter a search query to disable alerts.");
    }
  };

  const totalJobs = filteredJobs.length;
  const totalPages = Math.ceil(totalJobs / card_per);

  const handlePrevPage = (): void => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = (): void => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const getCurrentPageJobs = (): SerializableJobResult[] => {
    const startIndex = (currentPage - 1) * card_per;
    const endIndex = startIndex + card_per;
    return filteredJobs.slice(startIndex, endIndex);
  };

  const shouldShowPagination = totalJobs > card_per;

  const handleFilterChange = (newFilters: any) => {
    if (!searchResults) return;

    const filtered = searchResults.similarJobs.filter((job) => {
      return (
        (newFilters.jobType.length === 0 ||
          newFilters.jobType.includes(job.job_type)) &&
        (newFilters.securityClearance.length === 0 ||
          newFilters.securityClearance.includes(job.security_clearance)) &&
        (newFilters.locationType.length === 0 ||
          newFilters.locationType.includes(job.location_type)) &&
        (newFilters.compensationType.length === 0 ||
          newFilters.compensationType.includes(job.compensation_type)) &&
        (newFilters.remoteFlexibility === null ||
          job.remote_flexibility === newFilters.remoteFlexibility) &&
        (newFilters.salaryMin === "" ||
          (job.starting_salary &&
            job.starting_salary >= parseInt(newFilters.salaryMin))) &&
        (newFilters.salaryMax === "" ||
          (job.maximum_salary &&
            job.maximum_salary <= parseInt(newFilters.salaryMax)))
      );
    });

    setFilteredJobs(filtered);
    setCurrentPage(1);
  };

  return (
    <div className="p-2">
      <h1 className="text-md font-bold text-gray-900 mb-6">
        Opportunity Search
      </h1>
      <div className="flex space-x-2 mb-6">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Enter job title or keywords"
          className="flex-grow"
        />
        <Button
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSearch()}
          disabled={isLoading || searchQuery.trim() === ""}
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

      {searchSuggestions.length > 0 && (
        <Collapsible
          open={isSearchSuggestionsOpen}
          onOpenChange={setIsSearchSuggestionsOpen}
          className="mb-6"
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="mb-2 p-0 h-auto">
              {isSearchSuggestionsOpen ? (
                <ChevronUp className="h-4 w-4 mr-2" />
              ) : (
                <ChevronDown className="h-4 w-4 mr-2" />
              )}
              <span className="text-sm font-semibold text-gray-700">
                {isSearchSuggestionsOpen ? "Hide" : "Show"} Search Suggestions
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-wrap gap-2">
              {searchSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    setSearchQuery(suggestion);
                    setIsSearchSuggestionsOpen(false);
                    handleSearch(suggestion);
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {hasSearched && searchResults && (
        <div className="mt-4">
          {searchResults.match && filteredJobs.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold text-gray-800">
                  Search Results
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setIsFilterDialogOpen(true)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
              {getCurrentPageJobs().map((job) =>
                renderJobDetails(
                  job,
                  bookmarkedJobs,
                  handleBookmarkToggle,
                  viewDetails,
                  formatSalary,
                  formatHourlyRate
                )
              )}

              {shouldShowPagination && (
                <div className="flex justify-between items-center mt-4">
                  <Button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center text-gray-600 text-sm gap-x-3">
              <p className="mr-2">
                No matching opportunities found currently. New positions open up
                frequently, so check back soon or enable alerts to stay updated.
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleThumbsUp}
                      className="p-0 h-auto"
                    >
                      <Bell className="w-4 h-4 text-green-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white">
                    <p>Yes, alert me when opportunities are available</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleThumbsDown}
                      className="p-0 h-auto ml-1"
                    >
                      <BellOff className="w-4 h-4 text-red-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white">
                    <p>No, don't alert me</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      )}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search Filters</DialogTitle>
          </DialogHeader>
          <JobFilters
            jobs={searchResults?.similarJobs || []}
            onFilterChange={handleFilterChange}
            filterChoices={filterChoices}
            setFilterChoices={setFilterChoices}
          />
        </DialogContent>
      </Dialog>

      <SearchFeatureDialog
        open={isSearchDialogOpen}
        onOpenChange={setIsSearchDialogOpen}
      />
    </div>
  );
};
