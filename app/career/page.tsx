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
    const candidateID = "4f5e180c-dd25-4c9d-8e42-cb50d9e374be";
    const startEvent = await candidateStartOnboard(candidateID);
    console.log(startEvent);
  }, []); // Dependencies array is empty, so this memoizes the function until the component unmounts

  const finalize = useCallback(async () => {
    const candidateID = "4f5e180c-dd25-4c9d-8e42-cb50d9e374be";
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
