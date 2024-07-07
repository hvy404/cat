import useStore from "@/app/state/useStore";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jobDescriptionFinishOnboard } from "@/lib/dashboard/finish-onboard";
import { QueryEventStatus } from "@/lib/dashboard/query-runner-status";

export default function AddJDStepThree() {
  // Get AddJD state from the store
  const { addJD, setAddJD, user, setSelectedMenuItem } = useStore((state) => ({
    addJD: state.addJD,
    setAddJD: state.setAddJD,
    user: state.user,
    setSelectedMenuItem: state.setSelectedMenuItem,
  }));

  const hasRun = useRef(false);

  // Start the publishing runner (final step of onboarding process)
  useEffect(() => {
    const finishOnboard = async () => {
      if (
        addJD.jdEntryID &&
        user &&
        !addJD.publishingRunnerID &&
        !hasRun.current &&
        addJD.step === 3
      ) {
        hasRun.current = true;

        const result = await jobDescriptionFinishOnboard(
          addJD.jdEntryID,
          user.uuid,
          user.session,
          user.company
        );

        if (result.success) {
          console.log("Finish onboard result: ", result.event[0]);

          setTimeout(() => {
            setAddJD({
              publishingRunnerID: result.event[0],
              isFinalizing: true,
            });
          }, 2000);
        }
      }
    };

    finishOnboard();
  }, [addJD.jdEntryID, user, addJD.step]);

  // Poll status of publishing runner
  useEffect(() => {
    let isStep3Mounted = true;

    if (!addJD.publishingRunnerID || !addJD.isFinalizing) {
      return;
    }

    let isPollingActive = true;

    // Function to handle the polling logic
    const pollEventStatus = async () => {
      if (addJD.publishingRunnerID !== null) {
        const status = await QueryEventStatus(addJD.publishingRunnerID);

        if (status === "Completed") {
          setAddJD({
            isFinalizing: false,
          });
          isPollingActive = false; // Stop polling

          goToDashboard();
        } else if (
          status === "Running" ||
          status === "Failed" ||
          status === "Cancelled"
        ) {
          if (isPollingActive) {
            setTimeout(pollEventStatus, 1000); // Continue polling every 1 second
          }
        } else {
          //console.error(`Unexpected status received: ${status}`);
          isPollingActive = false; // Stop polling on unexpected status
        }
      } else {
        //console.error("publishingRunnerID is null, cannot query event status");
        isPollingActive = false; // Stop polling since we don't have a valid ID
      }
    };

    // Start the polling
    pollEventStatus();

    // Cleanup function to stop polling when component unmounts or addJD.isFinalizing changes
    return () => {
      isPollingActive = false; // This will stop any scheduled polling operations
      isStep3Mounted = false;
    };
  }, [addJD.publishingRunnerID]);

  // Return to dashboard after completed
  const goToDashboard = () => {
    // Clean up the state
    setAddJD({
      filename: null,
      jdEntryID: null,
      session: null,
      isProcessing: false,
      isFinalizing: false,
      file: null,
      step: 1,
      jobDetails: [
        {
          jobTitle: "",
          location_type: "",
          min_salary: 0,
          max_salary: 0,
          salary_ote: 0,
          commission_percent: 0,
          security_clearance: "",
          salary_disclose: false,
          commission_pay: false,
        },
      ],
      jobDescriptionTitles: [],
      activeField: null,
      publishingRunnerID: null,
    });

    setSelectedMenuItem("dashboard");
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-semibold text-base leading-7 text-gray-900">
            Adding to Catalyst {addJD.jdEntryID} | Runner:{" "}
            {addJD.publishingRunnerID}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 leading-7">
          <div className="flex flex-row justify-center">
            {addJD.isFinalizing ? (
              <div className="flex flex-col justify-center text-center">
                <div className="flex flex-row justify-center">
                  <Loader className="w-12 h-12 animate-spin" />
                </div>
                <p>
                  Your job opportunity is currently being processed. Please hold
                  on for a moment...
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-center">
                  Your job opportunity has been successfully added and will
                  appear on the platform soon. <br />
                  You will be alerted as matches are identified.
                </p>
                <div className="flex flex-row justify-center">
                  <Button onClick={goToDashboard}>Go to dashboard</Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
