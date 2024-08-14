import { useEffect } from "react";
import useStore from "@/app/state/useStore";
import AddJobBreadcrumb from "@/app/(auth)/dashboard/views/employer/add-job/breadcrumb";
import AddNewJobStart from "@/app/(auth)/dashboard/views/employer/add-job/mods/panel-step-1";
import { Separator } from "@/components/ui/separator";
import { v4 as uuidv4 } from "uuid";
import AddJDStepOne from "@/app/(auth)/dashboard/views/employer/add-job/steps/step-1";
import AddJDStepTwo from "@/app/(auth)/dashboard/views/employer/add-job/steps/step-2";
import AddJDStepThree from "@/app/(auth)/dashboard/views/employer/add-job/steps/step-3";
import SidePanelStep2 from "@/app/(auth)/dashboard/views/employer/add-job/mods/panel-step-2";

export default function EmployerDashboardAddJob() {
  // Get AddJD state from the store
  const { user, addJD, setAddJD } = useStore();

  // Check the session on load and set it if it doesn't exist
  useEffect(() => {
    setAddJD({ session: uuidv4() });
  }, []);

  // Render the appropriate step based on the current step in state
  const renderCurrentStep = () => {
    switch (addJD.step) {
      case 1:
        return <AddJDStepOne />;
      case 2:
        return <AddJDStepTwo />;
      case 3:
        return <AddJDStepThree />;
      default:
        return <AddJDStepOne />;
    }
  };

  // Render the appropriate step based on the current step in state
  const renderCurrentSidePanel = () => {
    switch (addJD.step) {
      case 1:
        /* return <AddNewJobStart />; */
      case 2:
        return <SidePanelStep2 />;
      default:
        return <AddNewJobStart />;
    }
  };

  return (
    <main className="grid flex-1 gap-4 p-4 md:grid-cols-3 max-h-screen">
      <div className="relative flex-col items-start gap-4 flex md:col-span-2">
        <div className="flex w-full gap-6 rounded-lg border p-4 items-center">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Add a new job
          </h2>
          <Separator orientation="vertical" />
          <AddJobBreadcrumb />
          <div className="text-xs text-gray-200">
            <p>Filename: {addJD.filename}</p>
            <p>JD Entry ID: {addJD.jdEntryID}</p>
            <p>JD Session: {addJD.session}</p>
            <p>RunnerID: {addJD.publishingRunnerID}</p>
            <p>Company ID: {user?.company}</p>
          </div>
        </div>

        {renderCurrentStep()}
      </div>

      <div className="relative hidden md:flex max-h-[100vh] flex-col rounded-xl bg-muted/20 md:col-span-1">
        {renderCurrentSidePanel()}
      </div>
    </main>
  );
}
