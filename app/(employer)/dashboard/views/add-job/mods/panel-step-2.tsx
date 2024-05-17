import useStore from "@/app/state/useStore";
import Step2SubPanelTitle from "@/app/(employer)/dashboard/views/add-job/mods/panel-step-2-title";
import Step2SubPanelLocation from "@/app/(employer)/dashboard/views/add-job/mods/panel-step-2-location";
import Step2SubPanelClearance from "./panel-step-2-clearance";
import Step2SubPanelSalary from "./panel-step-2-salary";
import Step2SubPanelPrivateMode from "./panel-step-2-private";

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
        return <Step2SubPanelLocation />;
      case "securityClearance":
        return <Step2SubPanelClearance />;
      case "minSalary":
        return <Step2SubPanelSalary />;
      case "maxSalary":
        return <Step2SubPanelSalary />;
      case "privateEmployer":
        return <Step2SubPanelPrivateMode />;
      default:
        return <div>Placeholder</div>;
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center rounded-lg border border-dashed hover:border-slate-500 shadow-sm transition-colors duration-500 ease-in-out gap-4">
      {renderCurrentSubPanel()}
    </div>
  );
}
