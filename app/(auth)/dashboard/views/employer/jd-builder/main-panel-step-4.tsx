import useStore from "@/app/state/useStore";
import JDWriter from "@/app/(auth)/dashboard/views/employer/jd-builder/lib/writer/jd-writer";

export default function JDBuilderEditor() {
  // Get state from the store
  const { jdBuilderWizard } = useStore();

  return (
    <div className="w-full">
      {jdBuilderWizard.jobDescriptionId && <JDWriter />}
    </div>
  );
}
