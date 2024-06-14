import { useEffect, useState } from "react";
import useStore from "@/app/state/useStore";
import { grabRolesAndPersonnel } from "@/lib/jd-builder/fetcher/fetch-detected-roles";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Wand, Loader, KeyRound } from "lucide-react";
import { StartJDGeneration } from "@/app/(employer)/dashboard/views/jd-builder/lib/runners/starting-jd-generation";
import { QueryJDGenerationStatus } from "@/lib/dashboard/query-role-jd-generation"; // Get the SOW ID from the generated JD

export default function JDBuilderDetectedRoles() {
  // Get state from the store
  const {
    jdBuilderWizard,
    setJDBuilderWizard,
    user,
    toggleExpansion,
  } = useStore();

  // Get the sowID from the store
  const sowID = jdBuilderWizard.sowID ?? "";
  const employerID = user?.uuid ?? "";
  const step = jdBuilderWizard.step;
  const roleToGenerate = jdBuilderWizard.roleToGenerate;
  const jdGenerationRunnerID = jdBuilderWizard.jdGenerationRunnerID;

  const [isGenerationInProgress, setIsGenerationInProgress] = useState(false);

  useEffect(() => {
    const fetchRolesAndKeyPersonnel = async () => {
      if (sowID) {
        const { roles, keyPersonnel } = await grabRolesAndPersonnel(sowID);
        setJDBuilderWizard({ personnelRoles: { roles, keyPersonnel } });
      }
    };
  
    fetchRolesAndKeyPersonnel();
  }, []); 

  // onclick handler to set the role to generate
  // Handler to set the role to generate
  const handleClick = (item: string) => {
    if (!jdGenerationRunnerID) {
      // Allow changing selection if no generation is running
      setJDBuilderWizard({ roleToGenerate: item });
    }
  };

  // Start JD generation
  const startGeneration = async (item: string) => {
    if (roleToGenerate === item) {
      try {
        const runnerID = await StartJDGeneration({
          sowID,
          employerID,
          roleName: item,
        });
        //console.log("Starting JD generation for", item);
        toggleExpansion();
        setJDBuilderWizard({
          jdGenerationRunnerID: runnerID.id,
        });
        setIsGenerationInProgress(true); // Set generation progress to true
      } catch (error) {
        console.error("Failed to start JD generation", error);
      }
    }
  };

  // useffect to poll checkJDGenerationStatus
  useEffect(() => {
    if (!jdBuilderWizard.jdGenerationRunnerID) {
        return; // Exit if there is no runner ID
    }

    let isPollingActive = true; // Flag to control the active state of polling

    const polling = async () => {
        if (!jdBuilderWizard.jdGenerationRunnerID || !isPollingActive) {
            return; // Exit if polling should be inactive or if runner ID is absent
        }

        console.log("Polling JD Generation status....", jdBuilderWizard.jdGenerationRunnerID);
        const { status, jdID } = await QueryJDGenerationStatus(jdBuilderWizard.jdGenerationRunnerID);

        if (status === "Completed" && jdID) {
            //console.log("JD Generation completed with draft ID", jdID);
            isPollingActive = false;
            setJDBuilderWizard({ jobDescriptionId: jdID, step: 4 });
            setIsGenerationInProgress(false);
            // Handle the completion, e.g., update state or perform other actions
        } else if (status === "Running") {
            setTimeout(polling, 2500); // Continue polling if still running
        } else if (status === "Failed") {
            //console.log("JD Generation failed");
            isPollingActive = false;
            // TODO: Handle the failure, e.g., show error message
            setIsGenerationInProgress(false);
        } else if (status === "Cancelled") {
            //console.log("JD Generation cancelled");
            isPollingActive = false;
            // Handle the cancellation, e.g., show notification
            setIsGenerationInProgress(false);
        } else if (status === "No data") {
            //console.log("No data available for the JD Generation status");
            isPollingActive = false;
            // Handle the no data case, e.g., show warning
            setIsGenerationInProgress(false);
        } else if (status === "Error fetching data") {
            //console.log("Error fetching JD Generation status");
            isPollingActive = false;
            // Handle the error, e.g., show error message
            setIsGenerationInProgress(false);
        } else {
            //console.log(`Unknown status: ${status}`);
            isPollingActive = false;
            // Handle unknown status, e.g., show warning or error
        }
    };

    // Start polling after 2.5 seconds
    setTimeout(polling, 2500);

    // Cleanup function to stop polling when component unmounts
    return () => {
        isPollingActive = false;
    };
}, [jdBuilderWizard.jdGenerationRunnerID]);



  return (
    <div className="w-full">
      <div className="flex flex-col justify-center">
        <div className="flex flex-col overflow-y-auto max-h-[65vh] gap-4">
          <AnimatePresence>
            {jdBuilderWizard.personnelRoles.roles.map((role, index) => (
              <motion.div
                key={`role-${role}-${index}`} // Updated key to include the array name
                onClick={() => handleClick(role)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  ${roleToGenerate === role ? "border-2 border-slate-700" : ""}
                  ${isGenerationInProgress && roleToGenerate !== role ? "opacity-50 pointer-events-none" : ""}
                  ${!jdGenerationRunnerID ? "cursor-pointer" : ""}
                  flex justify-between flex-row bg-gray-100/60 rounded-md p-4 text-gray-900 items-center text-sm hover:bg-gray-200/50 transition-all duration-200 ease-linear
                `}
              >
                <span>{role}</span>
                {roleToGenerate === role &&
                  (jdGenerationRunnerID ? (
                    <div className="ml-auto text-gray-700 flex flex-row gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    <Button
                      variant="default"
                      className="gap-2"
                      onClick={() => startGeneration(role)}
                    >
                      <Wand className="h-4 w-4" />
                      <span>Generate JD</span>
                    </Button>
                  ))}
              </motion.div>
            ))}
            {jdBuilderWizard.personnelRoles.keyPersonnel.map(
              (person, index) => (
                <motion.div
                  key={`keyPersonnel-${person}-${index}`} // Updated key to include the array name
                  onClick={() => handleClick(person)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    delay:
                      (index + jdBuilderWizard.personnelRoles.roles.length) *
                      0.1,
                  }}
                  className={`
                    ${roleToGenerate === person ? "border-2 border-slate-700" : "opacity-50"}
                    ${isGenerationInProgress && roleToGenerate !== person ? "opacity-50 pointer-events-none" : ""}
                    ${!jdGenerationRunnerID ? "cursor-pointer" : ""}
                    flex justify-between flex-row bg-gray-100/60 rounded-md p-4 text-gray-900 items-center text-sm hover:bg-gray-200/50 transition-all duration-200 ease-linear
                  `}
                >
                  <div className="flex flex-row gap-2 items-center justify-center">
                    <p>{person}</p>
                    <KeyRound className="w-4 h-4" />
                  </div>
                  {roleToGenerate === person &&
                    (jdGenerationRunnerID ? (
                      <div className="ml-auto text-gray-700 flex flex-row gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Generating...
                      </div>
                    ) : (
                      <Button
                        variant="default"
                        className="gap-2"
                        onClick={() => startGeneration(person)}
                      >
                        <Wand className="h-4 w-4" />
                        <span>Generate JD</span>
                      </Button>
                    ))}
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="flex flex-row gap-2 text-sm">
      </div>
    </div>
  );
}
