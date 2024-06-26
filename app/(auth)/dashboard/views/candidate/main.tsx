import useStore from "@/app/state/useStore";
import { useEffect, useState, useRef } from "react";
import { candidateStatus } from "@/lib/candidate/status";
import CandidateDashboardRightPanel from "@/app/(auth)/dashboard/views/candidate/right-panel-main";
import { CandidateOnboardingForm } from "@/app/(auth)/dashboard/views/candidate/main-onboard-form";
import { CandidateDashboard } from "@/app/(auth)/dashboard/views/candidate/main-user-dashboard";

interface StatusResponse {
  success: boolean;
  payload: boolean | string;
}

export default function CandidateDashboardMain() {
  const { isExpanded, setExpanded, user } = useStore();
  const candidateDashboardStep = useStore(
    (state) => state.candidateDashboard.step
  );
  const setCandidateDashboard = useStore(
    (state) => state.setCandidateDashboard
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create a ref to track if the effect has already run
  const isActive = useRef(false);

  // Fetch the candidate status on mount
  useEffect(() => {
    if (!isActive.current && user && user.uuid) {
      isActive.current = true;
      setIsLoading(true);
      candidateStatus(user.uuid)
        .then((isOnboarded) => {
          if (isOnboarded === true) {
            setCandidateDashboard({ step: 1 });
          } else {
            setCandidateDashboard({ step: 0 });
          }
          setIsLoading(false);
        })
        .catch((err) => {
          setError("Failed to fetch candidate status");
          setIsLoading(false);
        });
    }
  }, [user, setCandidateDashboard]);

  // Render the main panel based on the current step
  const MainPanel = () => {
    switch (candidateDashboardStep) {
      case 0:
        return <CandidateOnboardingForm />;
        case 1:
        return <CandidateDashboard />;
      default:
        return <div>Candidate Landing</div>;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      setExpanded(false);
    };
  }, [setExpanded]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-[70vh] items-center justify-center">
        <div className="font-semibold text-2xl text-gray-600 flex items-center">
          Loading
          <div className="dots ml-2 flex">
            <span className="animate-wave">.</span>
            <span className="animate-wave">.</span>
            <span className="animate-wave">.</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-gray-700 font-sm">Error: {error}</div>;
  }

  return (
    <main className="flex flex-1 gap-4 p-4">
      <div
        className={`flex flex-col gap-4 transition-all duration-700 ease-in-out w-full md:w-full max-h-[90vh] overflow-y-auto ${
          isExpanded ? "lg:w-3/4" : "lg:w-3/5"
        }`}
      >
        <div className="flex justify-between gap-6 rounded-lg border p-4">
          <h2 className="font-bold leading-6 text-gray-900">
            Candidate Landing
          </h2>
        </div>
        <div className="flex flex-col gap-6">
          <MainPanel />
        </div>
      </div>
      <div
        className={`hidden md:flex flex-col gap-4 transition-all duration-700 ease-in-out max-h-screen overflow-y-auto ${
          isExpanded ? "lg:w-1/4" : "lg:w-1/2"
        }`}
      >
        <CandidateDashboardRightPanel step={candidateDashboardStep} />
      </div>
    </main>
  );
}
