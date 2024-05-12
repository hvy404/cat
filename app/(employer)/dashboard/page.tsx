import EmployerDashboardNavigation from "@/app/(employer)/dashboard/navigation";
import EmployerDashboardHeader from "@/app/(employer)/dashboard/header";
import EmployerDashboardBody from "@/app/(employer)/dashboard/body";

export default function Dashboard() {
  return (
    <div className="grid h-screen w-full pl-[56px]">
      <EmployerDashboardNavigation />
      <div className="flex flex-col">
        <EmployerDashboardHeader />
        <EmployerDashboardBody />
      </div>
    </div>
  );
}
