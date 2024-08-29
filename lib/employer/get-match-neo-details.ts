"use server";
import {
  getJobNode,
  getRelationshipNodes as getJobRelatedNodes,
} from "@/lib/jobs/mutation";
import {
  getTalentNodeNoEmbedding,
  getRelationshipNodes,
} from "@/lib/candidate/global/mutation";

export async function getAIRecommendationDetails(
  jobId: string,
  candidateId: string
) {
  console.log("job", jobId);
  console.log("candidate", candidateId);
  try {
    const jobNode = await getJobNode(jobId);
    const candidateNode = await getTalentNodeNoEmbedding(candidateId);

    const jobRelationships = await fetchJobRelationships(jobId);
    const candidateRelationships = await fetchCandidateRelationships(
      candidateId
    );

    const comparisonData = prepareComparisonData(
      jobNode,
      candidateNode,
      jobRelationships,
      candidateRelationships
    );

    const result = {
      jobInfo: jobNode
        ? {
            id: jobNode.job_id,
            title: jobNode.job_title || "",
            description: jobNode.summary || "",
            location: Array.isArray(jobNode.location)
              ? jobNode.location
              : JSON.parse(jobNode.location || "[]"),
            type: jobNode.job_type || "",
            relationships: jobRelationships,
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
            id: candidateNode.applicant_id,
            name: candidateNode.name || "",
            email: candidateNode.email || "",
            phone: candidateNode.phone || "",
            city: candidateNode.city || "",
            state: candidateNode.state || "",
            zipcode: candidateNode.zipcode || "",
            relationships: candidateRelationships,
          }
        : null,
      comparisonData,
    };

    return { success: true, data: result };
  } catch (error) {
    console.error("Error in getAIRecommendationDetails:", error);
    return { success: false, error: "Failed to fetch recommendation details" };
  }
}

async function fetchJobRelationships(jobId: string) {
  const relationshipsToFetch = [
    "REQUIRES_SKILL",
    "PREFERS_SKILL",
    "REQUIRED_CERTIFICATION",
  ] as const;

  const jobRelationships = await Promise.all(
    relationshipsToFetch.map(async (relationType) => {
      const nodes = await getJobRelatedNodes(jobId, relationType);
      return { [relationType]: nodes };
    })
  ).then((results) => Object.assign({}, ...results));

  return jobRelationships;
}

async function fetchCandidateRelationships(candidateId: string) {
  const relationshipsToFetch = [
    "WORKED_AT",
    "STUDIED_AT",
    "HAS_SKILL",
    "HAS_CERTIFICATION",
  ] as const;

  const candidateRelationships = await Promise.all(
    relationshipsToFetch.map(async (relationType) => {
      const nodes = await getRelationshipNodes(candidateId, relationType);
      return { [relationType]: nodes };
    })
  ).then((results) => Object.assign({}, ...results));

  return candidateRelationships;
}

function prepareComparisonData(
  jobNode: any,
  candidateNode: any,
  jobRelationships: any,
  candidateRelationships: any
) {
  return {
    skills: {
      candidate: candidateRelationships.HAS_SKILL || [],
      jobRequired: jobRelationships.REQUIRES_SKILL || [],
      jobPreferred: jobRelationships.PREFERS_SKILL || [],
    },
    experience: {
      candidate: candidateRelationships.WORKED_AT || [],
      jobRequired: jobNode?.experience || null,
    },
    education: {
      candidate: candidateRelationships.STUDIED_AT || [],
      jobRequired: jobNode?.education ? [jobNode.education] : [],
    },
    certifications: {
      candidate: candidateRelationships.HAS_CERTIFICATION || [],
      jobRequired: jobRelationships.REQUIRED_CERTIFICATION || [],
    },
  };
}
