import useStore from "@/app/state/useStore";
import EmployerDashboardView from "@/app/(auth)/dashboard/views/overview/main-employer-panel";
import EmployerDashboardOverviewRoles from "@/app/(auth)/dashboard/views/overview/main-role-overview";
import InboundApplicantsSidePanel from "@/app/(auth)/dashboard/views/overview/side-panels/inbound-applications-view";

const DefaultRightPanel = () => (
  <div className="flex items-center justify-center h-full">
    <p className="text-gray-500">Welcome</p>
  </div>
);

export default function EmployerDashboardMain() {
  const { employerRightPanelView } = useStore();

  const getRightPanelContent = () => {
    switch (employerRightPanelView) {
      case 'roleOverview':
        return <EmployerDashboardOverviewRoles />;
        case 'inboundApplications':
          return <InboundApplicantsSidePanel />;
      default:
        return <DefaultRightPanel />;
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