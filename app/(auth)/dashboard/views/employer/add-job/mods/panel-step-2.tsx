import useStore from "@/app/state/useStore";
import Step2SubPanelTitle from "@/app/(auth)/dashboard/views/employer/add-job/mods/panel-step-2-title";
/* import Step2SubPanelLocation from "@/app/(auth)/dashboard/views/employer/add-job/mods/panel-step-2-location";
import Step2SubPanelClearance from "@/app/(auth)/dashboard/views/employer/add-job/mods/panel-step-2-clearance";
import Step2SubPanelSalary from "@/app/(auth)/dashboard/views/employer/add-job/mods/panel-step-2-salary"; */
import Step2SubPanelPrivateMode from "@/app/(auth)/dashboard/views/employer/add-job/mods/panel-step-2-private";
import Step2SubPanelDefault from "@/app/(auth)/dashboard/views/employer/add-job/mods/panel-step-2-default";
import Step2SubPanelDisplaySalary from "@/app/(auth)/dashboard/views/employer/add-job/mods/panel-step-2-show-salary";

/**
 * Renders the side panel for step 2 of adding a job.
 * @returns The JSX element representing the side panel.
 */

export default function SidePanelStep2() {
  const { addJD, setAddJD } = useStore((state) => ({
    addJD: state.addJD,
    setAddJD: state.setAddJD,
  }));

  /**
   * Renders the current subpanel based on the active form field.
   * @returns The JSX element representing the current subpanel.
   */

  const renderCurrentSubPanel = () => {
    switch (addJD.activeField) {
      case "jobTitle":
        return <Step2SubPanelTitle />;
      case "locationType":
        /* return <Step2SubPanelLocation />; */
        return <Step2SubPanelDefault />;
      case "securityClearance":
        /* return <Step2SubPanelClearance />; */
        return <Step2SubPanelDefault />;
      case "minSalary":
        /* return <Step2SubPanelSalary />; */
        /* TOOD: Showing default panel for now for future version */
        return <Step2SubPanelDefault />;
      case "maxSalary":
        /* return <Step2SubPanelSalary />; */
        return <Step2SubPanelDefault />;
      case "privateEmployer":
        return <Step2SubPanelPrivateMode />;
      case "discloseSalary":
        return <Step2SubPanelDisplaySalary />;
      default:
        return <Step2SubPanelDefault />;
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center rounded-lg border border-dashed hover:border-slate-500 shadow-sm transition-colors duration-500 ease-in-out gap-4 px-4 lg:px-0">
      {renderCurrentSubPanel()}
    </div>
  );
}
