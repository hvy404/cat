import { useState, useEffect } from "react";
import {
  Briefcase,
  ChevronRight,
  ChevronLeft,
  ChevronRightIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchUserInvites } from "@/lib/dashboard/candidate/retreive-invites";
import useStore from "@/app/state/useStore";

interface Job {
  id: string;
  title: string;
  company: string;
  status: string;
  inviteDate: string;
  jobId: string;
}

interface JobInvitedProps {
  handleViewMoreJobInvited: (jobId: string) => void;
}

const ITEMS_PER_PAGE = 3;

export const JobInvited: React.FC<JobInvitedProps> = ({ handleViewMoreJobInvited }) => {
  const [invitedJobs, setInvitedJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useStore((state) => ({ user: state.user }));

  useEffect(() => {
    const loadInvites = async () => {
      if (user?.uuid) {
        setIsLoading(true);
        setError(null);
        const result = await fetchUserInvites(user.uuid);
        if (result.success && result.invites) {
          setInvitedJobs(
            result.invites.map((invite: any) => ({
              id: invite.id,
              title: invite.title,
              company: invite.company,
              status: invite.status,
              inviteDate: invite.inviteDate,
              jobId: invite.jobId
            }))
          );
        } else {
          setError(result.error || "An error occurred while fetching invites.");
        }
        setIsLoading(false);
      }
    };

    loadInvites();
  }, [user]);

  const totalPages = Math.ceil(invitedJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = invitedJobs.slice(
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
          <Briefcase className="mr-2 h-5 w-5" />
          Jobs You're Invited To
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <p>Loading job invitations...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : invitedJobs.length === 0 ? (
          <p>No job invitations at the moment.</p>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-sm">{job.title}</h3>
                    <p className="text-xs text-gray-500">{job.company}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Invited: {new Date(job.inviteDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Badge
                      className={`text-xs mr-2 ${
                        job.status === "sent"
                          ? "bg-yellow-100 text-yellow-800"
                          : job.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {job.status}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewMoreJobInvited(job.jobId)}
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
        )}
      </CardContent>
    </Card>
  );
};

export default JobInvited;
