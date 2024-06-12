import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  getJobEmbedding,
  findSimilarTalents,
  getTalentProperties,
  getTalentRelationships,
  getTalentRelationshipDetails,
} from "@/lib/engine/retreive-talent";
import {
  getJobByJobID,
  getJobRelationships,
  getJobRelationshipDetails,
} from "@/lib/engine/retrieve-job";
import { evaluateTalentMatch } from "@/lib/engine/evaluate-talent-match";
import { calculateEnhancedScore } from "@/lib/engine/final-calculation";

export function MyProfileForm() {
  const handleClick = async () => {
    const jobID = "6d98e834-6513-4736-8cc8-b190a473ed3b";
    try {
      const embedding = await getJobEmbedding(jobID);
      if (!embedding) {
        console.log("No embedding found for the specified job.");
        return;
      }

      const threshold = 0.695;

      const similarTalents = await findSimilarTalents(embedding, threshold);
      console.log("Similar Talents:", similarTalents);
      // Handle the retrieved similar talents data as needed
    } catch (error) {
      console.error("Error retrieving similar talents:", error);
      // Handle the error appropriately (e.g., display an error message)
    }
  };

  const grabTalentProperties = async () => {
    const applicantID = "96eda40b-5fd1-4378-a4dd-e2ef63dc7a75";
    try {
      const talentProperties = await getTalentProperties(applicantID);
      console.log("Talent Properties:", talentProperties);
      // Handle the retrieved talent properties data as needed
    } catch (error) {
      console.error("Error retrieving talent properties:", error);
      // Handle the error appropriately (e.g., display an error message)
    }
  };

  const grabTalentRelationships = async () => {
    const applicantID = "96eda40b-5fd1-4378-a4dd-e2ef63dc7a75";
    try {
      const talentRelationships = await getTalentRelationships(applicantID);
      console.log("Talent Relationships:", talentRelationships);
      // Handle the retrieved talent relationships data as needed
    } catch (error) {
      console.error("Error retrieving talent relationships:", error);
      // Handle the error appropriately (e.g., display an error message)
    }
  };

  const getJobByID = async () => {
    const jobID = "6540e175-f9d4-48d9-acac-76f24917f16d";
    try {
      const job = await getJobByJobID(jobID);
      console.log("Job:", job);
      // Handle the retrieved job data as needed
    } catch (error) {
      console.error("Error retrieving job:", error);
      // Handle the error appropriately (e.g., display an error message)
    }
  };

  const getJobRelationshipsProps = async () => {
    const jobID = "6540e175-f9d4-48d9-acac-76f24917f16d";
    try {
      const jobRelationships = await getJobRelationships(jobID);
      console.log("Job Relationships:", jobRelationships);
      // Handle the retrieved job relationships data as needed
    } catch (error) {
      console.error("Error retrieving job relationships:", error);
      // Handle the error appropriately (e.g., display an error message)
    }
  };

  // getJobResponsibilities
  const getJobResponsibilitiesProps = async () => {
    const jobID = "6540e175-f9d4-48d9-acac-76f24917f16d";
    const relationshipType = "REQUIRES_QUALIFICATION";
    try {
      const jobResponsibilities = await getJobRelationshipDetails(
        jobID,
        relationshipType
      );
      console.log("Job Responsibilities:", jobResponsibilities);
      // Handle the retrieved job responsibilities data as needed
    } catch (error) {
      console.error("Error retrieving job responsibilities:", error);
      // Handle the error appropriately (e.g., display an error message)
    }
  };

  const getTalentRelationshipDeets = async () => {
    const applicantID = "70689ca0-ea2c-4a92-ac06-84ecfcd0a08e";
    const relationshipType = "WORKED_AT";
    try {
      const talentRelationshipDetails = await getTalentRelationshipDetails(
        applicantID,
        relationshipType
      );
      console.log("Talent Relationship Details:", talentRelationshipDetails);
      // Handle the retrieved talent relationship details data as needed
    } catch (error) {
      console.error("Error retrieving talent relationship details:", error);
      // Handle the error appropriately (e.g., display an error message)
    }
  };

  const evaluateTalent = async () => {
    const applicantID = "70689ca0-ea2c-4a92-ac06-84ecfcd0a08e";
    try {
      const combo = "E"; // or "B" or "C"

      const evals = await evaluateTalentMatch(
        applicantID,
        "6540e175-f9d4-48d9-acac-76f24917f16d",
        combo
      );

      console.log("Score", evals.evaluated, evals.score);
    } catch (error) {
      console.error("Error evaluating talent match:", error);
      // Handle the error appropriately (e.g., display an error message)
    }
  };

  const scores = {
       original: 0.8,       // Example original cosine similarity score
       A: 0.7,              // Example REQUIRES_SKILL - HAS_SKILL match score
       B: 0.6,              // Example REQUIRES_SKILL - HAS_SOFT_SKILL match score
       C: 0.9,              // Example REQUIRES_QUALIFICATION - WORKED_AT match score
       D: 0.8,              // Example REQUIRES_QUALIFICATION - STUDIED_AT match score
       E: 0.75,             // Example REQUIRED_EDUCATION - STUDIED_AT match score
       F: 0.85,             // Example REQUIRED_CERTIFICATION - HAS_CERTIFICATION match score
       G: 0.6,              // Example PREFERS_SKILL - HAS_SOFT_SKILL match score
       H: 0.7,              // Example REQUIRES_QUALIFICATION - HAS_INDUSTRY_EXPERIENCE match score
       I: 0.65              // Example SUITABLE_FOR_ROLE - HAS_POTENTIAL_ROLE match score
     };


  const handleGetFinalScore = async () => {
    const finalScore = calculateEnhancedScore(scores);
    console.log("Final Score:", finalScore);
  }

  

  return (
    <div className="flex flex-col gap-6">
      {/* Personal */}
      {/* TODO: Populate this from token, etc after auth is implemented */}
      <div className="rounded-lg border p-4 space-y-4">
        <h2 className="text-gray-800 text-sm font-semibold">Personal</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input type="firstName" id="firstName" placeholder="First name" />
          <Input type="lastName" id="lastName" placeholder="Last name" />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input type="email" id="email" placeholder="Email" />
        </div>
      </div>
      {/* Notications */}
      <div className="rounded-lg border p-4 space-y-4">
        <h2 className="text-gray-800 text-sm font-semibold">Notifications</h2>
        <div className="flex flex-col gap-4">
          {/* Switch 2 */}
          <div className="flex flex-row justify-between border border-1 border-gray-2oo rounded-md p-4">
            <p className="text-sm text-gray-700 font-normal">
              Receive email alerts for AI candidate matches
            </p>
            <div className="flex items-center space-x-2">
              <Switch id="airplane-mode" />
            </div>
          </div>

          {/* Switch 2 */}
          <div className="flex flex-row justify-between border border-1 border-gray-2oo rounded-md p-4">
            <p className="text-sm text-gray-700 font-normal">
              Receive email alerts of new job applicants
            </p>
            <div className="flex items-center space-x-2">
              <Switch id="airplane-mode" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <button
          onClick={handleClick}
          className="bg-blue-500 text-white rounded-md p-2"
        >
          Get Talent Matches
        </button>
        <button
          onClick={evaluateTalent}
          className="bg-blue-500 text-white rounded-md p-2"
        >
          Evaluate Talent Match
        </button>
        <button 
          onClick={handleGetFinalScore}>
          Get Final Score
        </button>
      </div>
    </div>
  );
}
