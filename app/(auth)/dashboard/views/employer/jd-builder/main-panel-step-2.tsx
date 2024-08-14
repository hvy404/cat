import { useEffect } from "react";
import useStore from "@/app/state/useStore";
import { QueryEventStatus } from "@/lib/dashboard/query-runner-status";
import { Loader } from "lucide-react";

export default function JDBuilderStartProcessing() {
  // Get state from the store
  const { jdBuilderWizard, setJDBuilderWizard, updateJDBuilderWizardStep } =
    useStore();

  // Get the sowID from the store
  const sowID = jdBuilderWizard.sowID ?? "";
  const step = jdBuilderWizard.step;
  const pollingStatus = jdBuilderWizard.pollingStatus;
  const runnerID = jdBuilderWizard.sowParseRunnerID;

  useEffect(() => {
    console.log("Polling useEffect triggered");
    if (!sowID || !runnerID || pollingStatus === true) {
      console.log("Returning early");
      return;
    }

    let isPollingActive = true;

    const polling = async () => {
      // Initial delay
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const pollFunction = async () => {
        try {
          const status = await QueryEventStatus(runnerID);
          console.log("status: ", status);

          if (status === "Completed") {
            setJDBuilderWizard({ pollingStatus: true });
            isPollingActive = false;
            updateJDBuilderWizardStep(step + 1);
          } else if (
            status === "Running" ||
            status === "Failed" ||
            status === "Cancelled"
          ) {
            console.log(status);
            if (isPollingActive) {
              setTimeout(pollFunction, 7500);
            }
          } else if (status === "No data") {
            // If "No data" is returned, continue polling
            if (isPollingActive) {
              setTimeout(pollFunction, 7500);
            }
          } else {
            console.log("Unexpected status:", status);
            isPollingActive = false;
          }
        } catch (error) {
          console.error("Error fetching status:", error);
          isPollingActive = false;
        }
      };

      pollFunction();
    };

    polling();

    return () => {
      isPollingActive = false;
    };
  }, [
    sowID,
    pollingStatus,
    runnerID,
    step,
    setJDBuilderWizard,
    updateJDBuilderWizardStep,
  ]);

  const nextStep = () => {
    updateJDBuilderWizardStep(step + 1);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 items-center overflow-y-auto max-h-[60vh]">
        <div className="flex flex-row gap-4 text-gray-400">
          <p>
            {/* Shows the file that's been uploade */}
            {jdBuilderWizard.sowFile.map((file: string) => (
              <div className="text-xs" key={file}>
                Active File: {file}
              </div>
            ))}
          </p>
        </div>

        <div className="flex flex-col h-dvh w-full items-center mx-auto">
          <Loader className="animate-spin" size={64} />
          <p className="text-sm text-gray-500">
            Replace with nicer illustation from lottle...
          </p>
        </div>
      </div>
    </div>
  );
}
