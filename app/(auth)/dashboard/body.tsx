"use client";
import EmployerDashboardAddJob from "@/app/(auth)/dashboard/views/employer/add-job/main";
import EmployerDashboardMain from "@/app/(auth)/dashboard/views/employer/overview/main";
import EmployerDashboardJDBuilder from "@/app/(auth)/dashboard/views/employer/jd-builder/main";
import EmployerDashboardDocuments from "@/app/(auth)/dashboard/views/employer/collection/main";
import EmployerDashboardProfile from "@/app/(auth)/dashboard/views/employer/profile/main";
import EmployerDashboardCandidateSearch from "@/app/(auth)/dashboard/views/employer/search/main";
import EmployerDashboardCompanyProfile from "@/app/(auth)/dashboard/views/employer/company-profile/main";
import EmployerDashboardUpgrade from "@/app/(auth)/dashboard/views/employer/subscription/main";
import CandidateDashboardSettings from "@/app/(auth)/dashboard/views/candidate/settings/main";
import CandidateDashboardMain from "@/app/(auth)/dashboard/views/candidate/main";
import CandidateDashboardExperience from "@/app/(auth)/dashboard/views/candidate/experience/main";
import CandidateDashboardEducation from "@/app/(auth)/dashboard/views/candidate/education/main";
import CandidateDashboardProfile from "@/app/(auth)/dashboard/views/candidate/profile/main";
import CandidateDashboardCertifications from "@/app/(auth)/dashboard/views/candidate/certifications/main";
import CandidateDashboardJobSearch from "@/app/(auth)/dashboard/views/candidate/search/main";
import CandidateResumeCopilot from "@/app/(auth)/dashboard/views/candidate/resume-copilot/main";
import AccountManage from "@/app/(auth)/dashboard/views/manage/page";
import useStore from "@/app/state/useStore";
import { useUser } from "@clerk/nextjs";

export default function DashboardBody() {
  const selectedMenuItem = useStore((state) => state.selectedMenuItem);
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div className="text-sm p-4">Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="text-sm p-4">Please sign in to access the dashboard.</div>
    );
  }

  const cuid = clerkUser?.publicMetadata?.aiq_cuid as string | undefined;
  const role = clerkUser?.publicMetadata?.aiq_role as string | undefined;

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
      case "company-profile":
        return <EmployerDashboardCompanyProfile />;
      case "upgrade":
        return <EmployerDashboardUpgrade />;
      case "talent-dashboard":
        return <CandidateDashboardMain />;
      case "talent-experience":
        return <CandidateDashboardExperience />;
      case "talent-education":
        return <CandidateDashboardEducation />;
      case "talent-profile":
        return <CandidateDashboardProfile />;
      case "talent-certifications":
        return <CandidateDashboardCertifications />;
      case "talent-search":
        return <CandidateDashboardJobSearch />;
      case "resume-copilot":
        return <CandidateResumeCopilot />;
      case "candidate-user-settings":
        return <CandidateDashboardSettings />;
      case "account-manage":
        return <AccountManage />;
      // Add more cases as needed for other components
      default:
        switch (role) {
          case "employer":
          case "employer-trial":
            return <EmployerDashboardMain />; // TODO: Make trial limit
          case "talent":
            return <CandidateDashboardMain />;
          default:
            return <div className="text-sm p-4">Contact support.</div>; // Or a default component
        }
    }
  };

  return <>{activeApp()}</>;
}
