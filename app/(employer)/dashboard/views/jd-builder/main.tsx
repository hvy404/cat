import useStore from "@/app/state/useStore";
import { useEffect } from "react";
import JDBuilderRightUpload from "./right-panel-upload";
import JDBuilderDetectedRoles from "./main-panel-detected-roles";
import JDBuilderEditor from "./main-panel-jd-writer";

export default function EmployerDashboardJDBuilder() {
  const { jdBuilderWizard, setJDBuilderWizard, updateJDBuilderWizardStep } =
    useStore();

  const { isExpanded, setExpanded, toggleExpansion } = useStore();

  // useeffect to set jdBuilderWizard sowid to page load. sowid = ec3350f7-cba8-4b1f-a11c-cf042844a603
  useEffect(() => {
    setJDBuilderWizard({ sowID: "ec3350f7-cba8-4b1f-a11c-cf042844a603" });
  }, [setJDBuilderWizard]);

  // Reset expanded state when component unmounts
  useEffect(() => {
    return () => {
      setExpanded(false);
    };
  }, [setExpanded]);

  return (
    <main className="flex flex-1 gap-4 p-4 max-h-screen overflow-hidden h-screen">
      <div
        className={`flex flex-col gap-4 transition-all duration-700 ease-in-out w-full md:w-full ${
          isExpanded ? "lg:w-3/4" : "lg:w-1/2"
        }`}
      >
        <div className="flex justify-between gap-6 rounded-lg border p-4">
          <h2 className="font-bold leading-6 text-gray-900">Section Title</h2>
          <button
            onClick={toggleExpansion}
            className="p-1 bg-slate-600 text-white text-sm rounded"
          >
            Toggle Expand
          </button>
        </div>
        <div className="text-xs text-gray-300 flex flex-row gap-4">
          <p>SOW ID: {jdBuilderWizard.sowID}</p>
          <p>Step: {jdBuilderWizard.step}</p>
        </div>
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              {/* Step 2  - Load the detected roles*/}
              {/*  <JDBuilderDetectedRoles />  */}
              {/* Step 3 - Load editor to edit the JD generate */}
              <JDBuilderEditor />
            </div>
          </div>
        </div>
      </div>
      <div
        className={`hidden md:flex flex-col gap-4 transition-all duration-700 ease-in-out ${
          isExpanded ? "lg:w-1/4" : "lg:w-1/2"
        }`}
      >
        <div className="min-h-[90vh] rounded-xl bg-muted/50 p-4 overflow-auto flex items-center justify-center">
          <div className="flex flex-col items-center justify-center w-full">
            {/* Upload buttons */}
            <JDBuilderRightUpload />
          </div>
        </div>
      </div>
    </main>
  );
}
