"use client";
import { candidateStartOnboard } from "@/lib/candidate/onboard/extractResume";
import { generateTestSearch } from "@/lib/candidate/onboard/test";
import { useCallback } from "react";

/* export function startOnboard(candidateID: string) {
  console.log("Starting onboard for candidate with ID: ", candidateID);
  return candidateStartOnboard(candidateID);
} */

function Careers() {
  const resume = useCallback(async () => {
    const candidateID = "97ac9015-3fae-421d-844d-e0e44032f793";
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
