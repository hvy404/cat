"use client";
import { candidateStartOnboard } from "@/lib/candidate/onboard/extractResume";
import { generateTestSearch } from "@/lib/candidate/onboard/test";
import { useCallback } from 'react';

export function startOnboard(candidateID: string) {
  console.log("Starting onboard for candidate with ID: ", candidateID);
  return candidateStartOnboard(candidateID);
}

function Careers() {

const resume = useCallback(async () => {
    const candidateID = "70689ca0-ea2c-4a92-ac06-84ecfcd0a08e";
    const pageContent = await candidateStartOnboard(candidateID);
    console.log(pageContent);
}, []);  // Dependencies array is empty, so this memoizes the function until the component unmounts


  const test = async () => {
    const query =
      "We need to hire a fisherman for our fishing company. The fisherman should have experience in fishing and should be able to work in a team.";
    const embeddings = await generateTestSearch(query);
    //console.log(embeddings);
  };

  return (
    <div className="flex flex-col">
      <button onClick={resume}>Start onboard</button>

      <button onClick={test}>Generate embed</button>
    </div>
  );
}

export default Careers;
