"use client";
import EmployerDashboardOverview from "@/app/(employer)/dashboard/views/add-job/main";
import EmployerDashboardMain from "@/app/(employer)/dashboard/views/overview/main";
import useStore from "@/app/state/useStore";

/**
 * Renders the body component for the employer dashboard.
 * The component dynamically renders different sub-components based on the selected menu item.
 */
export default function EmployerDashboardBody() {
  const selectedMenuItem = useStore((state) => state.selectedMenuItem);

  /**
   * Returns the active sub-component based on the selected menu item.
   * @returns The active sub-component to render.
   */
  
const activeApp = () => {
  switch (selectedMenuItem) {
    case "playground":
      return <EmployerDashboardMain />;
    case "models":
      return <EmployerDashboardOverview />;
    // Add more cases as needed for other components
    default:
      return <EmployerDashboardMain />;
  }
};

  return <>{activeApp()}</>;
}