import useStore from "@/app/state/useStore";
import OverviewJobList from "@/app/(employer)/dashboard/views/overview/main-job-list";
import EmployerDashboardOverviewStats from "@/app/(employer)/dashboard/views/overview/main-stats-impression";
import EmployerDashboardOverviewRoles from "@/app/(employer)/dashboard/views/overview/main-role-overview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EmployerDashboardMain() {
  const { dashboard_role_overview } = useStore();

  return (
    <main className="grid flex-1 gap-4 p-4 md:grid-cols-2 max-h-screen">
      <div className="relative flex-col items-start gap-4 flex">
        <div className="grid w-full items-start gap-6">
          <div className="flex justify-between gap-6 rounded-lg border p-4">
            <h2 className="font-bold leading-6 text-gray-900">Scout</h2>
            <div>Search box</div>
          </div>
        </div>
        <div className="grid w-full items-start gap-6">
          <div className="grid gap-6 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Tabs defaultValue="active" className="w-full">
                <TabsList>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="paused">Paused</TabsTrigger>
                </TabsList>
                <TabsContent value="active">
                  
                  <OverviewJobList />
                </TabsContent>
                <TabsContent value="paused">
                  ...
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden md:flex min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4">
        <div className="grid w-full items-start gap-6 overflow-auto">
          <div className="grid gap-6">
            {/* Change this view if user is in role overview */}
            {dashboard_role_overview.active ? (
              <EmployerDashboardOverviewRoles />
            ) : (
              <EmployerDashboardOverviewStats />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
