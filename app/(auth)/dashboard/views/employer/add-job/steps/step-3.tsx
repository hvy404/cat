import useStore from "@/app/state/useStore";
import { useEffect, useRef, useState, useCallback } from "react";
import { jobDescriptionFinishOnboard } from "@/lib/dashboard/finish-onboard";
import { QueryEventStatus } from "@/lib/dashboard/query-runner-status";
import { fetchUserCompanyId } from "@/lib/dashboard/get-company-membership";
import { useUser } from "@clerk/nextjs";
import WaitingState from "@/app/(auth)/dashboard/views/employer/add-job/mods/step-3-loading";
import { CancelJDParser } from "@/lib/dashboard/infer/from-jd/cancel-jd-parser";
import { CleanUpOnCancel } from "@/lib/dashboard/ingest-jd/cleanup-on-cancel";
import { v4 as uuidv4 } from "uuid";

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
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const hasRun = useRef(false);

  // Fetch the user's company ID
  useEffect(() => {
    const getCompanyId = async () => {
      if (cuid && !companyId) {
        try {
          //console.log("Fetching company ID for cuid:", cuid);
          const result = await fetchUserCompanyId(cuid);
          if (result.success) {
            //console.log("Company ID fetched successfully:", result.companyId);
            setCompanyId(result.companyId);
          } else {
            //console.error("Failed to fetch company ID:", result.error);
          }
        } catch (error) {
          //console.error("Error fetching company ID:", error);
        } finally {
          //console.log("Setting isCompanyIdFetched to true");
          setIsCompanyIdFetched(true);
        }
      } else {
        //console.log("No need to fetch company ID, setting isCompanyIdFetched to true");
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
        isCompanyIdFetched &&
        !addJD.finishingStarted
      ) {
        hasRun.current = true;
        setAddJD({ finishingStarted: true });
  
        try {
          const result = await jobDescriptionFinishOnboard(
            addJD.jdEntryID,
            cuid,
            companyId,
            addJD.session || ""
          );
  
          if (result.success) {
            setAddJD({
              isFinalizing: true,
            });
  
            setTimeout(() => {
              setAddJD({
                publishingRunnerID: result.event[0],
              });
            }, 2000);
          } else {
            setAddJD({ finishingStarted: false });
          }
        } catch (error) {
          setAddJD({ finishingStarted: false });
        }
      }
    };
  
    finishOnboard();
  }, [
    addJD.jdEntryID,
    addJD.step,
    addJD.session,
    addJD.finishingStarted,
    addJD.publishingRunnerID,
    cuid,
    companyId,
    isCompanyIdFetched,
    setAddJD,
  ]);
  

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showSuccess) {
      timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showSuccess]);

  const cancelPost = async () => {
    if (!cuid || !addJD.jdEntryID) {
      console.error("User not logged in or JD Entry ID not found");
      return;
    }

    try {
      await CancelJDParser({ sessionID: addJD.session! });

      await CleanUpOnCancel({
        jdId: addJD.jdEntryID,
        employerId: cuid,
        filename: addJD.filename,
      });

      // Reset the application state
      setAddJD({
        step: 1,
        jdEntryID: null,
        jobDetails: [],
        activeField: null,
        publishingRunnerID: null,
        session: uuidv4(),
        filename: null, // Reset the filename
        onboardingStarted: false,
        finishingStarted: false,
      });
      setSelectedMenuItem("dashboard");
    } catch (error) {
      console.error("Error cancelling post:", error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  // Return to dashboard after completed
  const goToDashboard = useCallback(() => {
    // Clean up the state
    setAddJD({
      onboardingStarted: false,
      finishingStarted: false,
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
  }, [setAddJD, setSelectedMenuItem]);

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
            finishingStarted: false,
          });
          setIsProcessingComplete(true);
          setShowSuccess(true);
          isPollingActive = false;
          // Set a timeout to call goToDashboard after a delay
          setCountdown(10);
          setTimeout(() => {
            goToDashboard();
          }, 10000); // 10 seconds delay
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
  }, [addJD.publishingRunnerID, addJD.isFinalizing, goToDashboard, setAddJD]);

  return (
    <WaitingState
      isFinalizing={addJD.isFinalizing}
      isProcessingComplete={isProcessingComplete}
      showSuccess={showSuccess}
      goToDashboard={goToDashboard}
      countdown={countdown}
      onCancelPost={cancelPost}
    />
  );
}
