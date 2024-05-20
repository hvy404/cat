import { useState, useEffect } from "react";
import useStore from "@/app/state/useStore";
import { ShieldPlus } from "lucide-react";

export default function Step2SubPanelPrivateMode() {
  /*   const { addJD, setAddJD } = useStore((state) => ({
    addJD: state.addJD,
    setAddJD: state.setAddJD,
  }));
 */

  return (
    <div>
      <div className="flex flex-col gap-4 items-center justify-center p-4 lg:p-8 text-gray-700 text-sm">
        <ShieldPlus className="h-8 w-8 text-gray-600" />
        <div>
          <h3 className="text-gray-700 font-medium">
            Private mode
          </h3>
          <p>
            When you post a job in private mode, your company name and logo will
            not be visible to job seekers. This is a great option if you want to
            keep your hiring activities confidential.
          </p>
        </div>
        <div>
          <h3 className="text-gray-700 font-medium">
            When does my company name appear?
          </h3>
          <p>
            Your company name will be visible to candidates who you have invited to interview.
          </p>
        </div>
      </div>
    </div>
  );
}
