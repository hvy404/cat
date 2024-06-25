import useStore from "@/app/state/useStore";
import { Separator } from "@/components/ui/separator";
import PreviousSOWDropdown from "@/app/(auth)/dashboard/views/jd-builder/lib/history/previous-sow";

export default function JDBuilderNewStart() {
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

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 items-center overflow-y-auto justify-center min-h-[60vh]">
        <div className="flex flex-col w-full mx-auto items-center">
          <p className="text-sm text-gray-500">
            Upload your SOW/PWS to get started
          </p>
        </div>
        <Separator orientation="horizontal" className="md:w-1/2"/>
        <div className="flex flex-row items-center gap-2">
          <p className="text-sm text-gray-500">or</p>
          <PreviousSOWDropdown />
        </div>
      </div>
    </div>
  );
}
