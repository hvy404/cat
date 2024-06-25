import { useState, useEffect } from "react";
import useStore from "@/app/state/useStore";
import { Button } from "@/components/ui/button";

export default function Step2SubPanelLocation() {
  /*   const { addJD, setAddJD } = useStore((state) => ({
    addJD: state.addJD,
    setAddJD: state.setAddJD,
  }));
 */

  return (
    <div>
      <div className="flex flex-col gap-4">Location</div>
    </div>
  );
}
