import useStore from "@/app/state/useStore";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jobDescriptionFinishOnboard } from "@/lib/dashboard/finish-onboard";
import { QueryEventStatus } from "@/lib/dashboard/query-runner-status";
import { fetchUserCompanyId } from "@/lib/dashboard/get-company-membership";
import { useUser } from "@clerk/nextjs";

export default function AddJDStepThree() {
  // Clerk
  const { user: clerkUser } = useUser();
  const cuid = clerkUser?.publicMetadata?.aiq_cuid as string | undefined;

  // Get AddJD state from the store
  const { addJD, setAddJD, user, setSelectedMenuItem } = useStore((state) => ({
    addJD: state.addJD,
    setAddJD: state.setAddJD,
    user: state.user,
    setSelectedMenuItem: state.setSelectedMenuItem,
  }));
  const [companyId, setCompanyId] = useState(null);
  const [isCompanyIdFetched, setIsCompanyIdFetched] = useState(false);
  const hasRun = useRef(false);

  // Fetch the user's company ID
  useEffect(() => {
    const getCompanyId = async () => {
      if (cuid && !companyId) {
        try {
          console.log("Fetching company ID for cuid:", cuid);
          const result = await fetchUserCompanyId(cuid);
          if (result.success) {
            console.log("Company ID fetched successfully:", result.companyId);
            setCompanyId(result.companyId);
          } else {
            console.error("Failed to fetch company ID:", result.error);
          }
        } catch (error) {
          console.error("Error fetching company ID:", error);
        } finally {
          console.log("Setting isCompanyIdFetched to true");
          setIsCompanyIdFetched(true);
        }
      } else {
        console.log(
          "No need to fetch company ID, setting isCompanyIdFetched to true"
        );
        setIsCompanyIdFetched(true);
      }
    };

    getCompanyId();
  }, [cuid, companyId]);

  // Start the publishing runner (final step of onboarding process)
  useEffect(() => {
    const finishOnboard = async () => {
      if (
        addJD.jdEntryID &&
        cuid &&
        companyId &&
        !addJD.publishingRunnerID &&
        !hasRun.current &&
        addJD.step === 3 &&
        isCompanyIdFetched
      ) {
        hasRun.current = true;

        try {
          const result = await jobDescriptionFinishOnboard(
            addJD.jdEntryID,
            cuid,
            companyId
          );

          if (result.success) {
            console.log("Finish onboard result: ", result.event[0]);
            setAddJD({
              isFinalizing: true,
            });

            setTimeout(() => {
              setAddJD({
                publishingRunnerID: result.event[0],
              });
            }, 2000);
          } else {
            console.error("Failed to finish onboard");
          }
        } catch (error) {
          console.error("Error in finishOnboard:", error);
        }
      }
    };

    finishOnboard();
  }, [addJD.jdEntryID, user, cuid, companyId, addJD.step, isCompanyIdFetched]);

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

          console.log("Comlpetion of onboarding process");
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
          console.error(`Unexpected status received: ${status}`);
          isPollingActive = false; // Stop polling on unexpected status
        }
      } else {
        console.error("publishingRunnerID is null, cannot query event status");
        isPollingActive = false; // Stop polling since we don't have a valid ID
      }
    };

    // Start the polling
    pollEventStatus();

    // Cleanup function
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
        <CardContent className="text-sm text-gray-700 leading-7">
          <div className="flex flex-col gap-4 justify-center">
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
              <>
                <p className="text-center">
                  Your job opportunity has been successfully added and will
                  appear on the platform soon. <br />
                  You will be alerted as matches are identified.
                </p>
                <div className="flex flex-row justify-center">
                  <Button onClick={goToDashboard}>Go to dashboard</Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
