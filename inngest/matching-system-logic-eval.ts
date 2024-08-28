import { inngest } from "@/lib/inngest/client";
import {
  getJobNode,
  getRelationshipNodes as getJobRelatedNodes,
} from "@/lib/jobs/mutation";
import {
  getTalentNodeNoEmbedding,
  getRelationshipNodes,
} from "@/lib/candidate/global/mutation";
import { evaluateJobCandidateMatch } from "@/lib/engine/llm-evaluation";
import { v4 as uuidv4 } from "uuid";

type RelationshipType =
  | "WORKED_AT"
  | "STUDIED_AT"
  | "HAS_SKILL"
  | "HAS_CERTIFICATION"
  | "HAS_INDUSTRY_EXPERIENCE"
  | "HAS_POTENTIAL_ROLE"
  | "HAS_SOFT_SKILL"
  | "WORKED_ON"
  | "AUTHORED"
  | "SUBMITTED";

function isValidRelationshipType(type: string): type is RelationshipType {
  return [
    "WORKED_AT",
    "STUDIED_AT",
    "HAS_SKILL",
    "HAS_CERTIFICATION",
    "HAS_INDUSTRY_EXPERIENCE",
    "HAS_POTENTIAL_ROLE",
    "HAS_SOFT_SKILL",
    "WORKED_ON",
    "AUTHORED",
    "SUBMITTED",
  ].includes(type);
}

export const performLLMFinalEvaluation = inngest.createFunction(
  { id: "perform-llm-final-evaluation" },
  { event: "app/llm-final-evaluation" },
  async ({ event, step }) => {
    const { jobId, candidateId, enhancedScore } = event.data;

    const jobNode = await step.run("fetch-job-node", async () => {
      return await getJobNode(jobId);
    });

    const candidateNode = await step.run("fetch-candidate-node", async () => {
      return await getTalentNodeNoEmbedding(candidateId);
    });

    const relationshipsToFetch = [
      "REQUIRES_SKILL",
      "PREFERS_SKILL",
      "SUITABLE_FOR_ROLE",
      "REQUIRED_CERTIFICATION",
    ] as const;

    const jobRelationships = jobNode
      ? await step.run("fetch-job-relationships", async () => {
          return await Promise.all(
            relationshipsToFetch.map(async (relationType) => {
              const nodes = await getJobRelatedNodes(jobId, relationType);
              return { [relationType]: nodes };
            })
          ).then((results) => Object.assign({}, ...results));
        })
      : null;

    const candidateRelationshipsToFetch = [
      "WORKED_AT",
      "STUDIED_AT",
      "HAS_SKILL",
      "HAS_CERTIFICATION",
    ] as const;

    const candidateRelationships = candidateNode
      ? await step.run("fetch-candidate-relationships", async () => {
          return await Promise.all(
            candidateRelationshipsToFetch.map(async (relationType) => {
              if (isValidRelationshipType(relationType)) {
                const nodes = await getRelationshipNodes(
                  candidateId,
                  relationType
                );
                return { [relationType]: nodes };
              }
              console.warn(
                `Unhandled relationship type for candidate: ${relationType}`
              );
              return {};
            })
          ).then((results) => Object.assign({}, ...results));
        })
      : {};

    const transformedData = {
      jobInfo: jobNode
        ? {
            id: Number(jobNode.job_id),
            title: jobNode.job_title || "",
            description: jobNode.summary || "",
            education: jobNode.education || "",
            location: Array.isArray(jobNode.location)
              ? jobNode.location
              : JSON.parse(jobNode.location || "[]"),
            type: jobNode.job_type || "",
            salary: {
              min: Number(jobNode.starting_salary) || 0,
              max: Number(jobNode.maximum_salary) || 0,
            },
            qualifications: jobNode.qualifications || null,
            experienceRequired: jobNode.experience || null,
            relationships: jobRelationships || {},
            compensationType: jobNode.compensation_type || "",
            salaryDisclose: jobNode.salary_disclose || null,
            startingSalary: Number(jobNode.starting_salary) || null,
            maximumSalary: Number(jobNode.maximum_salary) || null,
            hourlyCompMin: Number(jobNode.hourly_comp_min) || null,
            hourlyCompMax: Number(jobNode.hourly_comp_max) || null,
            commissionPay: jobNode.commission_pay || null,
            commissionPercent: Number(jobNode.commission_percent) || null,
            oteSalary: Number(jobNode.ote_salary) || null,
          }
        : null,
      candidateInfo: candidateNode
        ? {
            id: Number(candidateNode.applicant_id),
            email: candidateNode.email || "",
            name: candidateNode.name || "",
            phone: candidateNode.phone || "",
            city: candidateNode.city || "",
            state: candidateNode.state || "",
            zipcode: candidateNode.zipcode || "",
            relationships: candidateRelationships,
          }
        : null,
    };

    // Generate ID for match
    const newMatchId = uuidv4();
    
    // Call the LLM evaluation function
    const evaluationResult = await step.run(
      "perform-llm-evaluation",
      async () => {
        return await evaluateJobCandidateMatch(
          JSON.stringify(transformedData),
          newMatchId,
          jobId,
          candidateId,
          enhancedScore
        );
      }
    );

    return { jobId, candidateId, evaluationResult };
  }
);
