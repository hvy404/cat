import useStore from "@/app/state/useStore";
import { useEffect, useState } from "react";
import { MyProfileForm } from "@/app/(auth)/dashboard/views/profile/form";
import ProfileRightPanel from "@/app/(auth)/dashboard/views/profile/right-panel";
import { AIMatchExplanationPanel } from "@/app/(auth)/dashboard/views/profile/right-panel-ai-match";
import { NewApplicantAlertsPanel } from "@/app/(auth)/dashboard/views/profile/right-panel-applicant-alert";

export default function EmployerDashboardProfile() {
  const { isExpanded, setExpanded, toggleExpansion } = useStore();
  const [activeOption, setActiveOption] = useState("");

  // Reset expanded state when component unmounts
  useEffect(() => {
    return () => {
      setExpanded(false);
    };
  }, [setExpanded]);

  // Function to handle mouse enter
  const handleMouseEnter = (option: string) => {
    setActiveOption(option);
  };

  // Function to handle mouse leave
  const handleMouseLeave = () => {
    
    setActiveOption("");
  };

  // switch to render different right panel based on activeOption
  const renderRightPanel = () => {
    switch (activeOption) {
      case "applicant-alert":
        return <NewApplicantAlertsPanel />;
      case "ai-match":
        return <AIMatchExplanationPanel />;
      default:
        return <ProfileRightPanel />;
    }
  };

  return (
    <main className="flex flex-1 gap-4 p-4 max-h-screen overflow-hidden">
      <div
        className={`flex flex-col gap-4 transition-all duration-700 ease-in-out w-full md:w-full ${
          isExpanded ? "lg:w-3/4" : "lg:w-1/2"
        }`}
      >
        <div className="flex justify-between gap-6 rounded-lg border p-4">
          <h2 className="font-bold leading-6 text-gray-900">My Profile</h2>
        </div>
        <MyProfileForm 
          onMouseEnter={handleMouseEnter} 
          onMouseLeave={handleMouseLeave}
        />
      </div>
      <div
        className={`hidden md:flex flex-col gap-4 transition-all duration-700 ease-in-out ${
          isExpanded ? "lg:w-1/4" : "lg:w-1/2"
        }`}
      >
        <div className="min-h-[90vh] rounded-xl bg-muted/50 p-4 overflow-auto">
          {renderRightPanel()}
        </div>
      </div>
    </main>
  );
}