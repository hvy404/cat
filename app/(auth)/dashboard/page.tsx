import EmployerDashboardNavigation from "@/app/(auth)/dashboard/navigation";
import EmployerDashboardHeader from "@/app/(auth)/dashboard/header";
import EmployerDashboardBody from "@/app/(auth)/dashboard/body";

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
