import { useState, useEffect } from "react";
import useStore from "@/app/state/useStore";
import { Button } from "@/components/ui/button";

export default function Step2SubPanelPrivateMode() {
  /*   const { addJD, setAddJD } = useStore((state) => ({
    addJD: state.addJD,
    setAddJD: state.setAddJD,
  }));
 */

  return (
    <div>
      <div className="flex flex-col gap-4">PrivateMode</div>
    </div>
  );
}
