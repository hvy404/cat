import { useState } from "react";
import { FileText, PlusCircle, ArrowRightCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BookmarkedJob {
  jd_id: string;
  title: string;
}

interface JobBookmarkedProps {
  bookmarkedJobs: BookmarkedJob[];
  handleViewMoreJobBookmarked: (jobId: string) => void;
}

const EmptyStateCard = ({
  title,
  description,
  buttonText,
}: {
  title: string;
  description: string;
  buttonText: string;
}) => (
  <div className="w-full h-full bg-white border-gray-300 flex flex-col rounded-lg">
    <div className="pb-2">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="py-4 flex-grow flex flex-col justify-between">
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <Button
        variant="outline"
        size="sm"
        className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 self-start"
      >
        <PlusCircle className="mr-2 h-4 w-4" /> {buttonText}
      </Button>
    </div>
  </div>
);

const MainViewJobListItem = ({
  job,
  handleViewMoreJobBookmarked,
}: {
  job: BookmarkedJob;
  handleViewMoreJobBookmarked: (jobId: string) => void;
}) => (
  <div
    key={job.jd_id}
    className="flex items-center justify-between transition-transform hover:translate-x-1 hover:border-l-4 hover:border-gray-400 px-4 border-l-4 border-transparent hover:bg-gray-50"
  >
    <div className="flex items-center">
      <FileText className="text-gray-600 w-5 h-5 mr-3" />
      <span className="text-gray-800 text-sm">{job.title}</span>
    </div>
    <Button
      variant="link"
      size="sm"
      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 flex items-center"
      onClick={() => handleViewMoreJobBookmarked(job.jd_id)}
    >
      Details
      <ArrowRightCircle className="ml-2 h-4 w-4" />
    </Button>
  </div>
);

const DialogJobListItem = ({ job }: { job: BookmarkedJob }) => (
  <div
    key={job.jd_id}
    className="flex items-center justify-between py-2 px-4 hover:bg-gray-50"
  >
    <div className="flex items-center">
      <FileText className="text-gray-600 w-4 h-4 mr-2" />
      <span className="text-gray-800 text-sm">{job.title}</span>
    </div>
    <Button
      variant="ghost"
      size="sm"
      className="text-gray-600 hover:text-gray-700 flex items-center"
    >
      Details
      <ArrowRightCircle className="ml-1 h-3 w-3" />
    </Button>
  </div>
);

export const JobBookmarked = ({
  bookmarkedJobs,
  handleViewMoreJobBookmarked,
}: JobBookmarkedProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const hasBookmarkedJobs = bookmarkedJobs && bookmarkedJobs.length > 0;
  const displayedJobs = hasBookmarkedJobs ? bookmarkedJobs.slice(0, 5) : [];
  const hasMoreJobs = bookmarkedJobs.length > 5;

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
        <FileText className="w-4 h-4 mr-2 text-gray-700" />
        Jobs You've Bookmarked
      </h2>
      <Card className="w-full flex-grow bg-white shadow-sm hover:shadow-md transition-all duration-300 border-gray-300 flex flex-col">
        <CardContent className="py-4 flex-grow">
          {hasBookmarkedJobs ? (
            <div className="space-y-4">
              {displayedJobs.map((job) => (
                <MainViewJobListItem key={job.jd_id} job={job} handleViewMoreJobBookmarked={handleViewMoreJobBookmarked} />
              ))}
              {hasMoreJobs && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                    >
                      View All
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>All Bookmarked Jobs</DialogTitle>
                      <DialogDescription>
                        Here's a complete list of all your bookmarked jobs.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 max-h-[60vh] overflow-y-auto">
                      {bookmarkedJobs.map((job) => (
                        <DialogJobListItem key={job.jd_id} job={job} />
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          ) : (
            <EmptyStateCard
              title="No Applications Yet"
              description="Explore a selection of roles handpicked for you, leveraging cutting-edge technology to connect your skills with premier opportunities. Start your personalized search today and discover the perfect match for your career ambitions."
              buttonText="Browse Jobs"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default JobBookmarked;
