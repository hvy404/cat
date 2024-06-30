import useStore from "@/app/state/useStore";
import { useEffect, useState, useRef } from "react";
import { JobSearch } from "@/app/(auth)/dashboard/views/candidate/search/finder";
import RightPanelSearchInfo from "@/app/(auth)/dashboard/views/candidate/search/panel";
import JobMoreDetails from "./job-details";

export default function CandidateDashboardJobSearch() {
  const { isExpanded, setExpanded, user } = useStore();
  const [viewDetails, setViewDetails] = useState("");
  const candidateDashboardStep = useStore(
    (state) => state.candidateDashboard.step
  );

  // onClick handler for the "View Details" button. Grab the job ID and console log it.
  const handleViewDetails = (jobId: string) => {
    console.log(jobId);
    setViewDetails(jobId);
  };

  const activeRightPanel = viewDetails ? (
    <JobMoreDetails jobId={viewDetails} onBack={() => setViewDetails("")} />
  ) : (
    <RightPanelSearchInfo />
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      setExpanded(false);
    };
  }, [setExpanded]);

  return (
    <main className="flex flex-1 gap-4 p-4">
      <div
        className={`flex flex-col gap-4 transition-all duration-700 ease-in-out w-full md:w-full max-h-[90vh] overflow-y-auto ${
          isExpanded ? "lg:w-3/4" : "lg:w-3/5"
        }`}
      >
        <div className="flex flex-col">
          <JobSearch viewDetails={handleViewDetails} />
        </div>
      </div>
      <div
        className={`hidden md:flex flex-col gap-4 transition-all duration-700 ease-in-out max-h-screen overflow-y-auto ${
          isExpanded ? "lg:w-1/4" : "lg:w-1/2"
        }`}
      >
        {activeRightPanel}
      </div>
    </main>
  );
}
