import { useState, useEffect, useRef } from "react";
import useStore from "@/app/state/useStore";
import {
  getSimplifiedJobPosts,
  Location,
  Opportunity,
  OpportunitiesData,
} from "@/lib/overview/fetchRoles";
import { Send } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface InviteActionWithListProps {
  applicantId: string;
}

export default function InviteActionWithList({
  applicantId,
}: InviteActionWithListProps) {
  const { user, isExpanded } = useStore();

  // Sthe id of the job posting to invite the candidate to
  const [jobToInvite, setJobToInvite] = useState<string | null>(null);
  const [popoverOpenState, setPopoverOpenState] = useState(false);
  const [opportunitiesData, setOpportunitiesData] = useState<
    Opportunity[] | null
  >(null);

  // onclick handler for the invite button, console logs the job uuid and applicant id, then resets the jobToInvite state
  // TODO: Implement the API call to send the invite
  const inviteToApply = (applicantId: string) => {
    if (jobToInvite) {
      console.log(`Inviting applicant ${applicantId} to job ${jobToInvite}`);
      // Here you would typically make an API call to send the invite
      // For example: sendInvite(applicantId, jobToInvite);
    } else {
      console.log("No job selected for invitation");
    }
    setJobToInvite(null);
    setPopoverOpenState(false);
  };

  // Fetch job list
  const fetchJobList = async () => {
    if (!user) {
      console.error("User not found");
      return null;
    }

    try {
      // Check session storage for existing data first
      const storedData = sessionStorage.getItem("opportunities");
      if (storedData) {
        try {
          const { timestamp, opportunities } = JSON.parse(storedData);
          if (
            new Date(timestamp).getTime() + 600000 > new Date().getTime() &&
            Array.isArray(opportunities)
          ) {
            return opportunities;
          }
        } catch (error) {
          console.error("Error parsing stored data:", error);
          // Clear invalid data from session storage
          sessionStorage.removeItem("opportunities");
        }
      }

      // If we reach this point, we need to fetch new data
      const simplifiedJobs = await getSimplifiedJobPosts(user.uuid, "active");

      if (simplifiedJobs && simplifiedJobs.length > 0) {
        // Save response to session storage along with timestamp
        const dataWithTimestamp = {
          timestamp: new Date().toISOString(),
          opportunities: simplifiedJobs,
        };

        sessionStorage.setItem(
          "opportunities",
          JSON.stringify(dataWithTimestamp)
        );

        return simplifiedJobs;
      } else {
        console.log("No job opportunities found");
        return [];
      }
    } catch (error) {
      console.error("Error fetching job posts:", error);
      return null;
    }
  };

  // Correct placement of useRef
  const isMounted = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!isMounted.current) {
        try {
          const opportunities = await fetchJobList();
          console.log("Opportunities:", opportunities);
          if (Array.isArray(opportunities)) {
            setOpportunitiesData(opportunities);
          } else {
            console.error("Opportunities is not an array:", opportunities);
          }
          isMounted.current = true;
        } catch (error) {
          console.error("Error in fetchData:", error);
        }
      }
    };

    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <Popover open={popoverOpenState} onOpenChange={setPopoverOpenState}>
      <PopoverTrigger>
        <Button className="items-center" variant={"secondary"}>
          <div className="flex items-center gap-2">
            <Send size={12} />
            {isExpanded ? "Invite" : "Invite to apply"}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col max-h-screen overflow-y-auto">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-gray-700 px-2 border-b-2 border-b-secondary pb-2">
            Select an opportunity
          </h3>
          {/* Rendering job posting */}
          {opportunitiesData ? (
            opportunitiesData.length > 0 ? (
              opportunitiesData.map((jobPosting: Opportunity) => (
                <div
                  key={jobPosting.job_uuid}
                  className={`flex flex-col gap-2 px-2 py-2 ${
                    jobPosting.job_uuid === jobToInvite ? "bg-gray-100/70" : ""
                  } hover:bg-gray-100/70 rounded-md cursor-pointer`}
                  onClick={() => setJobToInvite(jobPosting.job_uuid)}
                >
                  <h2 className="font-medium text-sm">{jobPosting.title}</h2>
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
                No active job opportunities found.
              </div>
            )
          ) : (
            <div className="text-sm text-gray-500 px-2 py-2">
              Loading job opportunities...
            </div>
          )}
        </div>
        {jobToInvite && (
          <div className="flex flex-col gap-2 pt-4">
            <Button
              variant={"secondary"}
              onClick={() => inviteToApply(applicantId)}
              disabled={!jobToInvite}
            >
              Send invite
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
