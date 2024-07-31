import { useEffect } from "react";
import useStore from "@/app/state/useStore";
import JDWriter from "@/app/(auth)/dashboard/views/employer/jd-builder/lib/writer/jd-writer";

export default function JDBuilderEditor() {
  // Get state from the store
  const { jdBuilderWizard } = useStore();

  /*   // TODO: Remove this done with development
  useEffect(() => {
    setJDBuilderWizard({
      jobDescriptionId: "f3a7e075-8cf6-4e9e-81a8-6fe910f22df3",
    });
  }, [setJDBuilderWizard]); */

  return (
    <div className="w-full">
      {jdBuilderWizard.jobDescriptionId && <JDWriter />}
    </div>
  );
}
