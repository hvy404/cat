import useStore from "@/app/state/useStore";
import { useEffect } from "react";
import CandidateSettingOptions from "./options";

export default function CandidateDashboardSettings() {
  const { isExpanded, setExpanded, user } = useStore();

  // if user is emply, return null
  if (!user) {
    return null;
  }

  // Reset expanded state when component unmounts
  useEffect(() => {
    return () => {
      setExpanded(false);
    };
  }, [setExpanded]);

  return (
    <main className="flex flex-1 gap-4 p-4 max-h-screen overflow-hidden">
      <div
        className={`flex flex-col gap-4 transition-all duration-700 ease-in-out max-h-[90vh] overflow-y-auto w-full md:w-full ${
          isExpanded ? "lg:w-3/4" : "lg:w-1/2"
        }`}
      >
        <div className="flex justify-between gap-6 rounded-lg border p-4">
          <h2 className="font-bold leading-6 text-gray-900">
            Account Preferences
          </h2>
          <div>Search box</div>
        </div>
        <div className="flex flex-col gap-6">
          {user && <CandidateSettingOptions />}
        </div>
      </div>
      <div
        className={`hidden md:flex flex-col gap-4 transition-all duration-700 ease-in-out ${
          isExpanded ? "lg:w-1/4" : "lg:w-1/2"
        }`}
      >
        <div className="min-h-[90vh] rounded-xl bg-muted/50 p-4 overflow-auto">
          <div className="grid gap-6">Right Column</div>
        </div>
      </div>
    </main>
  );
}
