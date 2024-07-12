"use client";
import {
  candidateStartOnboard,
  candidateFinalizeOnboard,
} from "@/lib/candidate/onboard/onboardResume";
import { useCallback } from "react";

/* export function startOnboard(candidateID: string) {
  console.log("Starting onboard for candidate with ID: ", candidateID);
  return candidateStartOnboard(candidateID);
} */

function Careers() {
  const resume = useCallback(async () => {
    const candidateID = "b0411a8b-c28c-4cb0-bae2-98f628adac6c";
    const startEvent = await candidateStartOnboard(candidateID);
    console.log(startEvent);
  }, []); // Dependencies array is empty, so this memoizes the function until the component unmounts

  const finalize = useCallback(async () => {
    const candidateID = "b0411a8b-c28c-4cb0-bae2-98f628adac6c";
    const finalizeEvent = await candidateFinalizeOnboard(candidateID);
    console.log(finalizeEvent);
  }, []); // Dependencies array is empty, so this memoizes the function until the component

  return (
    <div className="flex flex-col">
      <button onClick={resume}>Start onboard</button>
      <button onClick={finalize}>
        Start onboard - Part 2 - Generate Neo4J
      </button>
    </div>
  );
}

export default Careers;
