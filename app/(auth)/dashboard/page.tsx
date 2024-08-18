import DashboardNavigation from "@/app/(auth)/dashboard/navigation";
import DashboardHeader from "@/app/(auth)/dashboard/header";
import DashboardBody from "@/app/(auth)/dashboard/body";

export default function Dashboard() {
  return (
    <div className="grid h-screen w-full pl-[56px]">
      <DashboardNavigation />
      <div className="flex flex-col">
        <DashboardHeader />
        <DashboardBody />
      </div>
    </div>
  );
}
