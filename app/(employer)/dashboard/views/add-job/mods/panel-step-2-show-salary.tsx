import { useState, useEffect } from "react";
import useStore from "@/app/state/useStore";
import { Lightbulb } from "lucide-react";

export default function Step2SubPanelDisplaySalary() {
  const { addJD, setAddJD } = useStore((state) => ({
    addJD: state.addJD,
    setAddJD: state.setAddJD,
  }));

  /* {addJD.jobDetails[0].salary_disclose */
  return (
    <div>
      <div className="flex">
        <div className="flex flex-col gap-4 items-center justify-center p-4 lg:p-8 text-gray-700 text-sm">
          <Lightbulb className="h-8 w-8 text-gray-600" />
          <h3>
            We recognize the sensitivity around disclosing salary information.
            Job seekers are generally more inclined to apply for positions when
            salary details are provided.
          </h3>
          <p>
            Rest assured, your decision to disclose or withhold this information
            will not impact how your job post is matched on our platform.
          </p>
        </div>
      </div>
    </div>
  );
}
