import React, { useState } from "react";
import { Bookmark, ChevronRight, ChevronLeft, ChevronRightIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CandidateJobBookmark } from "@/app/(auth)/dashboard/views/candidate/search/bookmark";

interface JobBookmarkedProps {
  bookmarkedJobs: CandidateJobBookmark[];
  handleViewMoreJobBookmarked: (jobId: string) => void;
}

const ITEMS_PER_PAGE = 3;

export const JobBookmarked: React.FC<JobBookmarkedProps> = ({ bookmarkedJobs, handleViewMoreJobBookmarked }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(bookmarkedJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = bookmarkedJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Bookmark className="mr-2 h-5 w-5" />
          Jobs You've Bookmarked
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {bookmarkedJobs.length > 0 ? (
          <>
            <div className="space-y-4">
              {paginatedJobs.map((job) => (
                <div
                  key={job.jd_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-sm">{job.title}</h3>
                    <p className="text-xs text-gray-500">Company: N/A</p>

                  </div>
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewMoreJobBookmarked(job.jd_id)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                <span className="text-sm text-gray-500">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No bookmarked jobs yet.</p>
            <Button variant="outline" size="sm" className="mt-4">
              Browse Jobs
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobBookmarked;