import React, { useState } from "react";
import useStore from "@/app/state/useStore";
import {
  Briefcase,
  MapPin,
  ShieldCheck,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  jobSearchHandler,
  JobSearchResult,
  SerializableJobResult,
} from "./job-search";

type ExtendedJobSearchResult = JobSearchResult & {
  match: boolean;
  socket: boolean;
  similarJobs: SerializableJobResult[];
};

const card_per = 5;

export const JobSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] =
    useState<ExtendedJobSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const { user } = useStore();
  const userId = user?.uuid;

  const handleSearch = async (): Promise<void> => {
    if (!userId) {
      setError("User ID is not available. Please ensure you're logged in.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentPage(1);
    setHasSearched(true);

    try {
      const results = await jobSearchHandler(searchQuery, userId);
      setSearchResults(results as ExtendedJobSearchResult);
    } catch (err) {
      setError("An error occurred while searching for jobs. Please try again.");
      console.error("Job search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSalary = (salary: number | null): string => {
    return salary ? `$${salary.toLocaleString()}` : "Not specified";
  };

  const formatHourlyRate = (rate: number | null): string => {
    return rate ? `$${rate.toFixed(2)}` : "Not specified";
  };

  const renderJobDetails = (job: SerializableJobResult): JSX.Element => (
    <Card
      key={job.job_id}
      className="mb-4 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          {job.job_title}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          {job.company ? (
            job.company
          ) : (
            <span className="inline-flex flex-grow-0 rounded-xl text-xs bg-gray-900 text-white px-2 py-1">
              Private Employer
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-gray-700 space-y-2">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-gray-500" />
          <span>
            {JSON.parse(job.location)[0]?.city},{" "}
            {JSON.parse(job.location)[0]?.state}
          </span>
        </div>
        <div className="flex items-center">
          <ShieldCheck className="w-4 h-4 mr-2 text-gray-500" />
          <span>Security Clearance: {job.security_clearance}</span>
        </div>
        <div className="flex items-center">
          <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
          <span>Experience: {job.experience}</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-gray-500" />
          <span>Job Type: {job.job_type}</span>
        </div>
        {job.salary_disclose && (
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
            {job.compensation_type === "salary" && (
              <span>
                Salary Range: {formatSalary(job.starting_salary)} -{" "}
                {formatSalary(job.maximum_salary)}
              </span>
            )}
            {job.compensation_type === "hourly" && (
              <span>
                Hourly Rate: {formatHourlyRate(job.hourly_comp_min)} -{" "}
                {formatHourlyRate(job.hourly_comp_max)}
              </span>
            )}
            {job.compensation_type === "commission" && (
              <span>
                OTE: {formatSalary(job.ote_salary)} (Commission:{" "}
                {job.commission_percent}%)
              </span>
            )}
          </div>
        )}
        <p className="mt-2">{job.summary}</p>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );

  const totalJobs = searchResults?.similarJobs?.length ?? 0;
  const totalPages = Math.ceil(totalJobs / card_per);

  const handlePrevPage = (): void => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = (): void => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const getCurrentPageJobs = (): SerializableJobResult[] => {
    if (!searchResults?.similarJobs) return [];
    const startIndex = (currentPage - 1) * card_per;
    const endIndex = startIndex + card_per;
    return searchResults.similarJobs.slice(startIndex, endIndex);
  };

  const shouldShowPagination = totalJobs > card_per;

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
          placeholder="Enter job title or keywords"
          className="flex-grow"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {hasSearched && searchResults && (
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="results" className="text-sm">
              Search Results
            </TabsTrigger>
            <TabsTrigger value="filters" className="text-sm">
              Filters
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results">
            {searchResults.match && searchResults.similarJobs.length > 0 ? (
              <>
                {getCurrentPageJobs().map(renderJobDetails)}
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
              <p className="text-gray-600 text-sm">
                No matching opportunities found at this time.
              </p>
            )}
          </TabsContent>

          <TabsContent value="filters">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-md">Search Filters</CardTitle>
                <CardDescription>
                  Refine your job search results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Add filter options here */}
                <p className="text-gray-600">Filter options coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
