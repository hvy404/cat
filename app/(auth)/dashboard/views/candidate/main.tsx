import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import useStore from "@/app/state/useStore";
import { candidateStatus } from "@/lib/candidate/status";
import { CandidateOnboardingForm } from "@/app/(auth)/dashboard/views/candidate/main-onboard-form";
import { CandidateDashboard } from "@/app/(auth)/dashboard/views/candidate/main-user-dashboard";
import CandidateDashboardRightPanelWelcome from "@/app/(auth)/dashboard/views/candidate/right-panel-welcome";
import CandidateDashboardRightPanelDashboard from "@/app/(auth)/dashboard/views/candidate/right-panel-dashboard";

const MainPanel = React.memo(({ step }: { step: number }) => {
  switch (step) {
    case 0:
      return <CandidateOnboardingForm />;
    case 1:
      return <CandidateDashboard />;
    default:
      return <div>Loading...</div>;
  }
});

const RightPanel = React.memo(({ step }: { step: number }) => {
  switch (step) {
    case 0:
      return <CandidateDashboardRightPanelWelcome />;
    case 1:
      return <CandidateDashboardRightPanelDashboard />;
    default:
      return <div></div>;
  }
});

export default function CandidateDashboardMain() {
  const {
    isExpanded,
    setExpanded,
    user,
    candidateDashboard,
    setCandidateDashboard,
  } = useStore(
    useCallback(
      (state) => ({
        isExpanded: state.isExpanded,
        setExpanded: state.setExpanded,
        user: state.user,
        candidateDashboard: state.candidateDashboard,
        setCandidateDashboard: state.setCandidateDashboard,
      }),
      []
    )
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isActive = useRef(false);

  useEffect(() => {
    if (!isActive.current && user && user.uuid) {
      isActive.current = true;
      setIsLoading(true);
      candidateStatus(user.uuid)
        .then((isOnboarded) => {
          setCandidateDashboard({
            step: isOnboarded ? 1 : 0,
            onboarded: isOnboarded ?? undefined,
          });
          setIsLoading(false);
        })
        .catch((err) => {
          setError("Failed to fetch candidate status");
          setIsLoading(false);
        });
    }
  }, [user, setCandidateDashboard]);

  useEffect(() => {
    return () => {
      setExpanded(false);
    };
  }, [setExpanded]);

  const memoizedMainPanel = useMemo(
    () => <MainPanel step={candidateDashboard.step} />,
    [candidateDashboard.step]
  );
  const memoizedRightPanel = useMemo(
    () => <RightPanel step={candidateDashboard.step} />,
    [candidateDashboard.step]
  );

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
          <h2 className="font-bold leading-6 text-gray-900">Hello</h2>
        </div>
        <div className="flex flex-col gap-6">{memoizedMainPanel}</div>
      </div>
      <div
        className={`hidden md:flex flex-col gap-4 transition-all duration-700 ease-in-out max-h-screen overflow-y-auto ${
          isExpanded ? "lg:w-1/4" : "lg:w-1/2"
        }`}
      >
        <div className="min-h-[90vh] rounded-xl bg-muted/50 overflow-auto">
          {memoizedRightPanel}
        </div>
      </div>
    </main>
  );
}
