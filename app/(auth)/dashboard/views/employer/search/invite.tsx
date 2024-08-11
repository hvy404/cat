import { useState, useEffect, useCallback } from "react";
import useStore from "@/app/state/useStore";
import { getSimplifiedJobPosts, Opportunity } from "@/lib/overview/fetchRoles";
import { Send, Check, ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  createInvite,
  checkExistingInvite,
} from "@/lib/employer/create-invite";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

interface InviteActionWithListProps {
  applicantId: string;
}

const ITEMS_PER_PAGE = 5;

export default function InviteActionWithList({
  applicantId,
}: InviteActionWithListProps) {
    // Clerk
    const { user: clerkUser } = useUser();
    const cuid = clerkUser?.publicMetadata?.aiq_cuid as string | undefined;

  const { isExpanded } = useStore();

  const [jobToInvite, setJobToInvite] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [opportunitiesData, setOpportunitiesData] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<
    Opportunity[]
  >([]);
  const [inviteStatus, setInviteStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [invitedJobs, setInvitedJobs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const inviteToApply = async (applicantId: string) => {
    if (jobToInvite && cuid) {
      try {
        const result = await createInvite(cuid, applicantId, jobToInvite);
        setInviteStatus(result);
        if (result.success) {
          setInvitedJobs((prev) => new Set(prev).add(jobToInvite));
          setJobToInvite(null);
          toast.success("Invite sent successfully!");
        } else {
          toast.error("Failed to send invite. Please try again.");
        }
      } catch (error) {
        console.error("Error sending invite:", error);
        setInviteStatus({ success: false, message: "Failed to send invite" });
        toast.error("An error occurred while sending the invite.");
      }
    } else {
      setInviteStatus({
        success: false,
        message: "No job selected for invitation",
      });
      toast.error("Please select a job to send an invite.");
    }
  };

  const fetchJobList = async () => {
    if (!cuid) {
      console.error("User not found");
      return;
    }

    try {
      setIsLoading(true);
      const simplifiedJobs = await getSimplifiedJobPosts(cuid, "active");

      if (simplifiedJobs && simplifiedJobs.length > 0) {
        const invitedJobsSet = new Set<string>();
        await Promise.all(
          simplifiedJobs.map(async (job) => {
            const inviteExists = await checkExistingInvite(
              cuid,
              applicantId,
              job.job_uuid
            );
            if (inviteExists) {
              invitedJobsSet.add(job.job_uuid);
            }
          })
        );
        setInvitedJobs(invitedJobsSet);
        setOpportunitiesData(simplifiedJobs);
        setFilteredOpportunities(simplifiedJobs);
      } else {
        console.log("No job opportunities found");
        setOpportunitiesData([]);
        setFilteredOpportunities([]);
      }
    } catch (error) {
      console.error("Error fetching job posts:", error);
      setOpportunitiesData([]);
      setFilteredOpportunities([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dialogOpen) {
      fetchJobList();
    } else {
      setJobToInvite(null);
      setCurrentPage(1);
      setSearchTerm("");
    }
  }, [dialogOpen]);

  const filterOpportunities = useCallback(() => {
    const filtered = opportunitiesData.filter((job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOpportunities(filtered);
    setCurrentPage(1);
  }, [opportunitiesData, searchTerm]);

  useEffect(() => {
    filterOpportunities();
  }, [filterOpportunities]);

  const totalPages = Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE);
  const paginatedOpportunities = filteredOpportunities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="items-center" variant="secondary">
          <div className="flex items-center gap-2">
            <Send size={12} />
            {isExpanded ? "Invite" : "Invite to apply"}
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select an opportunity</DialogTitle>
        </DialogHeader>
        {opportunitiesData.length > 5 && (
          <div className="mb-4 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
        )}
        <ScrollArea className="mt-2 max-h-[60vh]">
          {isLoading ? (
            <div className="text-sm text-gray-500 px-2 py-2">
              Loading your job listings...
            </div>
          ) : paginatedOpportunities.length > 0 ? (
            paginatedOpportunities.map((jobPosting: Opportunity) => (
              <div
                key={jobPosting.job_uuid}
                className={`flex flex-col gap-2 px-2 py-2 ${
                  jobPosting.job_uuid === jobToInvite ? "bg-gray-100/70" : ""
                } ${
                  invitedJobs.has(jobPosting.job_uuid) ? "opacity-50" : ""
                } hover:bg-gray-100/70 rounded-md cursor-pointer`}
                onClick={() =>
                  !invitedJobs.has(jobPosting.job_uuid) &&
                  setJobToInvite(jobPosting.job_uuid)
                }
              >
                <div className="flex justify-between items-center">
                  <h2 className="font-medium text-sm">{jobPosting.title}</h2>
                  {invitedJobs.has(jobPosting.job_uuid) && (
                    <span className="text-green-500 text-xs flex items-center">
                      <Check size={12} className="mr-1" /> Invited
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-xs py-1">
                  {[
                    "Public Trust",
                    "Secret",
                    "Top Secret",
                    "Top Secret/SCI",
                    "Q Clearance",
                    "L Clearance",
                  ].includes(jobPosting.security_clearance) && (
                    <div className="inline-flex border rounded-lg border-gray-300 px-2 py-1 whitespace-nowrap">
                      {jobPosting.security_clearance}
                    </div>
                  )}
                  {(jobPosting.location[0].city ||
                    jobPosting.location[0].state) && (
                    <div className="inline-flex border rounded-lg border-gray-300 px-2 py-1 whitespace-nowrap">
                      {jobPosting.location[0].city &&
                        jobPosting.location[0].city}
                      {jobPosting.location[0].city &&
                        jobPosting.location[0].state &&
                        ", "}
                      {jobPosting.location[0].state &&
                        jobPosting.location[0].state}
                    </div>
                  )}
                  {jobPosting.location_type && (
                    <div className="inline-flex border rounded-lg border-gray-300 px-2 py-1 whitespace-nowrap">
                      {jobPosting.location_type}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 px-2 py-2">
              No matching job opportunities found.
            </div>
          )}
        </ScrollArea>
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        {jobToInvite && !invitedJobs.has(jobToInvite) && (
          <div className="flex flex-col gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                inviteToApply(applicantId);
                setDialogOpen(false);
              }}
              disabled={!jobToInvite}
            >
              Send invite
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
