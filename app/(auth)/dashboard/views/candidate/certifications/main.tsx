import useStore from "@/app/state/useStore";
import { useEffect, useState, useRef } from "react";
import CandidateDashboardRightPanel from "@/app/(auth)/dashboard/views/candidate/right-panel-main";
import Certifications from "@/app/(auth)/dashboard/views/candidate/edit/certifications";

export default function CandidateDashboardCertifications() {
  const { isExpanded, setExpanded, user } = useStore();
  const candidateDashboardStep = useStore(
    (state) => state.candidateDashboard.step
  );


  // Clean up on unmount
  useEffect(() => {
    return () => {
      setExpanded(false);
    };
  }, [setExpanded]);

  return (
    <main className="flex flex-1 gap-4 p-4">
      <div
        className={`flex flex-col gap-4 transition-all duration-700 ease-in-out w-full md:w-full max-h-[90vh] overflow-y-auto ${
          isExpanded ? "lg:w-3/4" : "lg:w-3/5"
        }`}
      >
        <div className="flex justify-between gap-6 rounded-lg border p-4">
          <h2 className="font-bold leading-6 text-gray-900">
            Manage your certifications
          </h2>
        </div>
        <div className="flex flex-col gap-6">
          <Certifications  />
        </div>
      </div>
      <div
        className={`hidden md:flex flex-col gap-4 transition-all duration-700 ease-in-out max-h-screen overflow-y-auto ${
          isExpanded ? "lg:w-1/4" : "lg:w-1/2"
        }`}
      >
        <CandidateDashboardRightPanel step={candidateDashboardStep} />
      </div>
    </main>
  );
}
