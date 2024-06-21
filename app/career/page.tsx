"use client";
import { candidateStartOnboard } from "@/lib/candidate/onboard/extractResume";
import { useCallback } from "react";

/* export function startOnboard(candidateID: string) {
  console.log("Starting onboard for candidate with ID: ", candidateID);
  return candidateStartOnboard(candidateID);
} */

function Careers() {
  const resume = useCallback(async () => {
    const candidateID = "5638c58b-7aab-4f02-b7b9-060c780bd3d1";
    const startEvent = await candidateStartOnboard(candidateID);
    console.log(startEvent);
  }, []); // Dependencies array is empty, so this memoizes the function until the component unmounts

  return (
    <div className="flex flex-col">
      <button onClick={resume}>Start onboard</button>
    </div>
  );
}

export default Careers;
