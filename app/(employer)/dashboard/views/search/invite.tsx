import { useState, useEffect } from "react";
import useStore from "@/app/state/useStore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const jobPostings = [
  {
    id: "1",
    title: "Software Engineer",
    location: "San Francisco, CA",
    clearance: "Secret",
  },
  {
    id: "2",
    title: "Data Analyst",
    location: "New York, NY",
    clearance: "Secret",
  },
  {
    id: "3",
    title: "Product Manager",
    location: "Austin, TX",
    clearance: "Secret",
  },
  {
    id: "4",
    title: "UX Designer",
    location: "Seattle, WA",
    clearance: "Secret",
  },
  {
    id: "5",
    title: "DevOps Engineer",
    location: "Remote",
    clearance: "Secret",
  },
];

export default function InviteActionWithList() {
  const { user, isExpanded } = useStore();

  // Sthe id of the job posting to invite the candidate to
  const [jobToInvite, setJobToInvite] = useState<string | null>(null);
  const [popoverOpenState, setPopoverOpenState] = useState(false);

  // onclick handler for the invite button, console logs the job id and resets the jobToInvite state
    const inviteToApply = () => {
        console.log(jobToInvite);
        setJobToInvite(null);
        setPopoverOpenState(false);
    };

  return (
    <Popover open={popoverOpenState} onOpenChange={setPopoverOpenState}>
      <PopoverTrigger>
        <Button variant={"secondary"}>{isExpanded ? 'Invite' : 'Invite to apply'}</Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col max-h-screen overflow-y-auto">
        <div className="flex flex-col gap-2">
            <h3 className="text-sm font-normal text-gray-700">Select an opportunity</h3>
          {/* Rendering job posting */}
          {jobPostings.map((jobPosting) => (
            <div
              key={jobPosting.id}
              className={`flex flex-col gap-2 px-2 py-2 ${jobPosting.id === jobToInvite ? 'bg-gray-100/70' : ''} hover:bg-gray-100/70 rounded-md cursor-pointer`}
              onClick={() => setJobToInvite(jobPosting.id)}
            >
              <h2 className="font-medium text-sm">{jobPosting.title}</h2>
              <div className="flex flex-row gap-2 text-xs py-1">
                <div className="border rounded-lg border-gray-300 px-2 py-1">
                  {jobPosting.clearance}
                </div>
                <div className="border rounded-lg border-gray-300 px-2 py-1">
                  {jobPosting.location}
                </div>
              </div>
            </div>
          ))}
        </div>
        {jobToInvite && (
          <div className="flex flex-col gap-2 pt-4">
            <Button variant={"secondary"} onClick={inviteToApply}>Invite to Apply</Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
