import { useEffect } from "react";
import useStore from "@/app/state/useStore";
import { QueryEventStatus } from "@/lib/dashboard/query-runner-status";
import { Loader } from "lucide-react";

export default function JDBuilderStartProcessing() {
  // Get state from the store
  const {
    jdBuilderWizard,
    setJDBuilderWizard,
    updateJDBuilderWizardStep,
    user,
  } = useStore();

  // Get the sowID from the store
  const sowID = jdBuilderWizard.sowID ?? "";
  const employerID = user?.uuid ?? "";
  const filename = jdBuilderWizard.sowFile[0] ?? "";
  const step = jdBuilderWizard.step;
  const pollingStatus = jdBuilderWizard.pollingStatus;
  const runnerID = jdBuilderWizard.sowParseRunnerID;

  // polling for the status by call getSOWIngestionStep function every 7.5 seconds until it returns 'true'
  useEffect(() => {
    if (!sowID || pollingStatus || !runnerID) {
      return;
    }

    let isPollingActive = true; // This flag will control the active state of polling

    const polling = async () => {
      const status = await QueryEventStatus(runnerID);

      if (status === "Completed") {
        setJDBuilderWizard({ pollingStatus: true });
        isPollingActive = false;
      } else if (
        status === "Running" ||
        status === "Failed" ||
        status === "Cancelled"
      ) {
        // Check status again after 7.5 seconds if it's not completed yet
        setTimeout(polling, 7500);
      } else {
        // Log any unexpected status or errors
        console.error(`Unexpected status received: ${status}`);
        isPollingActive = false;
      }
    };

    polling();

    // Cleanup function to stop polling when component unmounts or pollingStatus becomes true
    return () => {
      isPollingActive = false;
    };
  }, [sowID, pollingStatus]);

  // TODO: Delete after development
  // onclick handler to move to step 3
  const onClick = () => {
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
        <button onClick={onClick}>Next Step</button>
      </div>
    </div>
  );
}
