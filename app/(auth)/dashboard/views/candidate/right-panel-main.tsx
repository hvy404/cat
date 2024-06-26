import CandidateDashboardRightPanelWelcome from "@/app/(auth)/dashboard/views/candidate/right-panel-welcome";
import CandidateDashboardRightPanelDashboard from "@/app/(auth)/dashboard/views/candidate/right-panel-dashboard";

interface CandidateDashboardRightPanelProps {
  step: number;
  /* setStep?: (step: number) => void; */
}

const RenderRightPanel = ({ step }: CandidateDashboardRightPanelProps) => {
  switch (step) {
    case 0:
      return <CandidateDashboardRightPanelWelcome />;
    case 1:
      return <CandidateDashboardRightPanelDashboard />;
    default:
      return <div>No panel available for this step</div>;
  }
};

function CandidateDashboardRightPanel({
  step,
}: CandidateDashboardRightPanelProps) {
  return (
    <div className="min-h-[90vh] rounded-xl bg-muted/50 p-4 overflow-auto">
      <RenderRightPanel step={step} />
    </div>
  );
}

export default CandidateDashboardRightPanel;
