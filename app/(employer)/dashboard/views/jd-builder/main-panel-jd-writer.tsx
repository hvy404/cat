import React from "react";
import useStore from "@/app/state/useStore";
import JDWriter from "@/app/(employer)/dashboard/views/jd-builder/lib/writer/jdwriter";


export default function JDBuilderEditor() {
  // Get state from the store
  const { jdBuilderWizard, setJDBuilderWizard, updateJDBuilderWizardStep } =
  useStore();

  // Get the sowID from the store
  const sowID = jdBuilderWizard.sowID ?? '';


  return (
    <div className="w-full">
     <JDWriter />
    </div>
  );
}
