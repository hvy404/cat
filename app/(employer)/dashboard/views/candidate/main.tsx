import useStore from "@/app/state/useStore";
import { useEffect } from "react";
import CandidateDashboardRightPanel from "@/app/(employer)/dashboard/views/candidate/right-panel-main";
import { CandidateOnboardingForm } from "@/app/(employer)/dashboard/views/candidate/main-onboard-form";

export default function CandidateDashboardMain() {
  const { isExpanded, setExpanded, candidateDashboard, setCandidateDashboard } =
    useStore();

  // Reset layout on unmount
  useEffect(() => {
    return () => {
      setExpanded(false);
    };
  }, [setExpanded]);

  // Render the main panel based on the current step
  const MainPanel = () => {
    switch (candidateDashboard.step) {
      case 1:
        return <CandidateOnboardingForm />;
      default:
        return <div>Candidate Landing</div>;
    }
  };

  return (
    <main className="flex flex-1 gap-4 p-4">
      <div
        className={`flex flex-col gap-4 transition-all duration-700 ease-in-out w-full md:w-full max-h-[90vh] overflow-y-auto ${
          isExpanded ? "lg:w-3/4" : "lg:w-1/2"
        }`}
      >
        <div className="flex justify-between gap-6 rounded-lg border p-4">
          <h2 className="font-bold leading-6 text-gray-900">
            Candidate Landing
          </h2>
          <div>Search box</div>
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
        <CandidateDashboardRightPanel
          step={candidateDashboard.step}
          setStep={(step) => setCandidateDashboard({ step })}
        />
      </div>
    </main>
  );
}
