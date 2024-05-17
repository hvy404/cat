import useStore from "@/app/state/useStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AIMatchCandidateOverview from "@/app/(employer)/dashboard/views/overview/mods/match-candidate-grid";

export default function EmployerDashboardOverviewRoles() {
  const { setDashboardRoleOverview, dashboard_role_overview } = useStore();

  const handleReturnToDashboard = () => {
    setDashboardRoleOverview({ active: false, active_role_id: null });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleReturnToDashboard}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
          <h2 className="font-semibold text-sm">
            {dashboard_role_overview.active_role_id}
          </h2>
        </div>
        <div className="flex flex-row items-center">
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Button variant="ghost">Archive</Button>
          <Button variant="ghost">Pause</Button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle className="tmt-1 max-w-2xl text-sm leading-6 text-gray-900">Role Name</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="tmt-1 max-w-2xl text-sm leading-6 text-gray-500">Role description lorem ipsum</p>
            </CardContent>
          </Card>
        </div>
        <h2 className="text-base font-semibold leading-7 text-gray-900">Strong Candidates</h2>
        <div className="grid grids-col-2 lg:grid-cols-3 gap-4">
            <AIMatchCandidateOverview />
        </div>
      </div>
    </div>
  );
}
