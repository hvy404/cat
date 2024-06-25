import useStore from "@/app/state/useStore";
import { useEffect } from "react";
import JDBuilderNewStart from "@/app/(auth)/dashboard/views/jd-builder/main-panel-step-1"; // Step 1 - Left Panel
import JDBuilderRightUpload from "./right-panel-upload"; // Step 1 - Right Panel
import JDBuilderDetectedRoles from "./main-panel-step-3"; // Step 2.A
import JDBuilderRightStep2 from "./right-panel-step-2"; // Step 2 - Right Panel
import JDBuilderEditor from "./main-panel-step-4"; // Step 4
import JDBuilderRightStep4 from "./right-panel-step-4";
import JDBuilderRightStep3 from "./right-panel-step-3";
import { ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import JDBuilderStartProcessing from "@/app/(auth)/dashboard/views/jd-builder/main-panel-step-2"; // Step 2


export default function EmployerDashboardJDBuilder() {
  const { jdBuilderWizard, setJDBuilderWizard, updateJDBuilderWizardStep } =
    useStore();

  const { isExpanded, setExpanded, toggleExpansion } = useStore();

  // TODO: Remove this done with development
/*   useEffect(() => {
    setJDBuilderWizard({ sowID: "4c61fbe8-1808-4f6c-806a-948abe8c1a46" });
  }, [setJDBuilderWizard]); */

  // Reset expanded state when component unmounts
  useEffect(() => {
    return () => {
      setExpanded(false);
    };
  }, [setExpanded]);

  // Start over function
  const startOver = () => {
    setJDBuilderWizard({
      sowID: "",
      sowFile: [],
      sowParseRunnerID: "",
      jobDescriptionId: "",
      jdGenerationRunnerID: "",
      roleToGenerate: "",
      step: 1,
    });
  };

  const renderMainComponent = () => {
    switch (jdBuilderWizard.step) {
      case 1:
        return <JDBuilderNewStart />;
      case 2:
        return <JDBuilderStartProcessing />;
      case 3:
        return <JDBuilderDetectedRoles />;
      case 4:
        return <JDBuilderEditor />;
      default:
        return <JDBuilderDetectedRoles />;
    }
  };

  const renderRightPanelComponent = () => {
    switch (jdBuilderWizard.step) {
      case 1:
        return <JDBuilderRightUpload />;
      case 2:
        return <JDBuilderRightStep2 />;
      case 3:
        return <JDBuilderRightStep3 />;
      case 4:
        return <JDBuilderRightStep4 />;
      default:
        return <JDBuilderRightUpload />;
    }
  };

  return (
    <main className="flex flex-1 gap-4 p-4 max-h-screen overflow-auto h-screen">
      <div
        className={`flex flex-col gap-4 transition-all duration-700 ease-in-out w-full md:w-full ${
          isExpanded ? "lg:w-3/4" : "lg:w-1/2"
        }`}
      >
        <div className="flex justify-between items-center gap-6 rounded-lg border p-4">
          <h2 className="font-bold leading-6 text-gray-900">
            Job Description Copilot
          </h2>
          <div className="flex flex-row items-center">
            {jdBuilderWizard.step !== 1 && (
            <Button onClick={startOver} variant={"ghost"}>Start Over</Button>
            )}
            <Button
              size="icon"
              variant={"ghost"}
              onClick={toggleExpansion}
              className="p-1 text-sm rounded"
            >
              <ChevronsRight
                size={18}
                className={`transition-transform duration-500 ease-in-out transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />{" "}
            </Button>
          </div>
        </div>
        <div className="text-xs text-gray-300 flex flex-row gap-4">
          <p>SOW ID: {jdBuilderWizard.sowID}</p>
          <p>Step: {jdBuilderWizard.step}</p>
          <p>JD ID: {jdBuilderWizard.jobDescriptionId}</p>
          <p>Runner: {jdBuilderWizard.sowParseRunnerID}</p>
          <p>Step Completion: {jdBuilderWizard.pollingStatus ? "True" : "False"}</p>
        </div>
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              {renderMainComponent()}
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
            {renderRightPanelComponent()}
          </div>
        </div>
      </div>
    </main>
  );
}
