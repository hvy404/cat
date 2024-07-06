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
    const candidateID = "3dd74025-212e-48e6-8d7b-a2a5dbd7531a";
    const startEvent = await candidateStartOnboard(candidateID);
    console.log(startEvent);
  }, []); // Dependencies array is empty, so this memoizes the function until the component unmounts

  const finalize = useCallback(async () => {
    const candidateID = "3dd74025-212e-48e6-8d7b-a2a5dbd7531a";
    const finalizeEvent = await candidateFinalizeOnboard(candidateID);
    console.log(finalizeEvent);
  }, []); // Dependencies array is empty, so this memoizes the function until the component

  return (
    <div className="flex flex-col">
      <button onClick={resume}>Start onboard</button>
      <button onClick={finalize}>Start onboard - Part 2 - Generate Neo4J</button>
    </div>
  );
}

export default Careers;
