import useStore from "@/app/state/useStore";
import EmployerDashboardView from "@/app/(auth)/dashboard/views/employer/overview/main-employer-panel";
import EmployerDashboardOverviewRoles from "@/app/(auth)/dashboard/views/employer/overview/main-role-overview";
import InboundApplicantsSidePanel from "@/app/(auth)/dashboard/views/employer/overview/side-panels/inbound-applications-view";
import EmployerDashboardMainSidePanel from "@/app/(auth)/dashboard/views/employer/overview/side-panel";
import AIRecommendationsSidePanel from "@/app/(auth)/dashboard/views/employer/overview/side-panels/ai-match-inbound-view";
import EmployerAllJobsPosted from "@/app/(auth)/dashboard/views/employer/overview/side-panels/all-jobs-posted";

export default function EmployerDashboardMain() {
  const { employerRightPanelView } = useStore();

  const getRightPanelContent = () => {
    switch (employerRightPanelView.view) {
      case "roleOverview":
        return <EmployerDashboardOverviewRoles />;
      case "inboundApplications":
        return <InboundApplicantsSidePanel />;
      case "aiRecommendations":
        return <AIRecommendationsSidePanel />;
      case "allJobsPosted":
        return <EmployerAllJobsPosted />;
      default:
        return <EmployerDashboardMainSidePanel />;
    }
  };

  return (
    <main className="grid flex-1 gap-4 p-4 md:grid-cols-2 max-h-screen">
      <div className="relative flex-col items-start gap-4 flex">
        <EmployerDashboardView />
      </div>
      <div className="relative hidden md:flex min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4">
        <div className="grid w-full items-start gap-6 overflow-auto">
          {getRightPanelContent()}
        </div>
      </div>
    </main>
  );
}
