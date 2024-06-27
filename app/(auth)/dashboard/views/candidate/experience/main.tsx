import useStore from "@/app/state/useStore";
import { useEffect, useState, useRef } from "react";
import RightPanel from "@/app/(auth)/dashboard/views/candidate/experience/panel";
import WorkExperiences from "@/app/(auth)/dashboard/views/candidate/edit/work-experiences";
import { WorkExperience } from "@/app/(auth)/dashboard/views/candidate/experience/panel";
import { nanoid } from "nanoid";

interface StatusResponse {
  success: boolean;
  payload: boolean | string;
}

export default function CandidateDashboardExperience() {
  const { isExpanded, setExpanded, user } = useStore();
  const [selectedSuggestion, setSelectedSuggestion] = useState<
    WorkExperience | undefined
  >(undefined);
  const [workExperienceAnalysisSession, setWorkExperienceAnalysisSession] =
    useState<string>(nanoid(8));

  // Clean up on unmount
  useEffect(() => {
    return () => {
      setExpanded(false);
    };
  }, [setExpanded]);

  const handleSetSelectedSuggestion = (
    suggestion: WorkExperience | undefined
  ) => {
    setSelectedSuggestion(suggestion);
  };

  return (
    <main className="flex flex-1 gap-4 p-4">
      <div
        className={`flex flex-col gap-4 transition-all duration-700 ease-in-out w-full md:w-full max-h-[90vh] overflow-y-auto ${
          isExpanded ? "lg:w-3/4" : "lg:w-3/5"
        }`}
      >
        <div className="flex justify-between gap-6 rounded-lg border p-4">
          <h2 className="font-bold leading-6 text-gray-900">
            Manage your previous experiences
          </h2>
        </div>
        <div className="flex flex-col gap-6">
          <WorkExperiences selectedSuggestion={selectedSuggestion} />
        </div>
      </div>
      <div
        className={`hidden md:flex flex-col gap-4 transition-all duration-700 ease-in-out max-h-screen overflow-y-auto ${
          isExpanded ? "lg:w-1/4" : "lg:w-1/2"
        }`}
      >
        <RightPanel setSelectedSuggestion={handleSetSelectedSuggestion} workExperienceAnalysisSession={workExperienceAnalysisSession}  />
      </div>
    </main>
  );
}
