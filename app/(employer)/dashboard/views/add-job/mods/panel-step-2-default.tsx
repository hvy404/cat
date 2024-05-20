import { useState, useEffect } from "react";
import useStore from "@/app/state/useStore";
import { Button } from "@/components/ui/button";

export default function Step2SubPanelDefault() {
  /*   const { addJD, setAddJD } = useStore((state) => ({
    addJD: state.addJD,
    setAddJD: state.setAddJD,
  }));
 */

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-12 text-center">
       <h2 className="text-gray-900 leading-7 font-medium">You're almost finish!</h2>
        <p className="text-gray-700">We just need to confirm a few details before you can post your job.</p>
      </div>
    </div>
  );
}
