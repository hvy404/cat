"use client";
import EmployerDashboardAddJob from "@/app/(auth)/dashboard/views/add-job/main";
import EmployerDashboardMain from "@/app/(auth)/dashboard/views/overview/main";
import EmployerDashboardJDBuilder from "@/app/(auth)/dashboard/views/jd-builder/main";
import EmployerDashboardDocuments from "@/app/(auth)/dashboard/views/collection/main";
import EmployerDashboardProfile from "@/app/(auth)/dashboard/views/profile/main";
import EmployerDashboardCandidateSearch from "@/app/(auth)/dashboard/views/search/main";
import CandidateDashboardMain from "@/app/(auth)/dashboard/views/candidate/main";
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
      case "dashboard":
        return <EmployerDashboardMain />;
      case "add-job":
        return <EmployerDashboardAddJob />;
      case "jd-builder":
        return <EmployerDashboardJDBuilder />;
      case "documents":
        return <EmployerDashboardDocuments />;
      case "settings":
        return <EmployerDashboardProfile />;
      case "browse":
        return <EmployerDashboardCandidateSearch />;
      case "talent-resume":
        return <CandidateDashboardMain />;
      // Add more cases as needed for other components
      default:
        return <EmployerDashboardMain />;
    }
  };

  return <>{activeApp()}</>;
}
