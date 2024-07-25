"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import {
  getJobNode,
  getAllJobRelationships,
  getRelationshipNodes as getJobRelatedNodes,
} from "@/lib/jobs/mutation";
import {
  getTalentNodeNoEmbedding,
  getTalentRelationshipTypes,
  getRelationshipNodes,
} from "@/lib/candidate/global/mutation";

const cookieStore = cookies();
const supabase = createClient(cookieStore);

interface ApplicationInfo {
  id: string;
  submitDate: string;
  status: string;
  resumeKey: string;
}

interface JobInfo {
  id: number;
  title: string;
  description: string;
  location: Array<{ city: string; state: string; zipcode: string }>;
  type: string;
  salary: {
    min: number;
    max: number;
  };
  qualifications: string | null;
  experienceRequired: string | null;
  relationships: Record<string, any[]>;
}

interface CandidateInfo {
  id: number;
  email: string;
  name: string;
  phone: string;
  city: string;
  state: string;
  zipcode: string;
  relationships: Record<string, any[]>;
}

interface TransformedApplicationData {
  applicationInfo: ApplicationInfo;
  jobInfo: JobInfo | null;
  candidateInfo: CandidateInfo | null;
}

interface ApplicationError {
  error: string;
}

type ApplicationResult = TransformedApplicationData | ApplicationError;

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

function deepSerialize(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj === "function") {
    return undefined; // or you could return a string representation if needed
  }
  if (typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(deepSerialize);
  }
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (obj instanceof Map) {
    return Object.fromEntries(
      Array.from(obj.entries()).map(([k, v]) => [k, deepSerialize(v)])
    );
  }
  if (obj instanceof Set) {
    return Array.from(obj).map(deepSerialize);
  }
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, deepSerialize(v)])
  );
}

function serializeRelationships(
  relationships: Record<string, any[]>
): Record<string, any[]> {
  return deepSerialize(relationships);
}

export async function getApplicationDetailedView(
  applicationId: string
): Promise<ApplicationResult> {
  try {
    // Fetch basic application info from Supabase
    const { data: supabaseData, error: supabaseError } = await supabase
      .from("applications")
      .select("id, created_at, status, resume_id, job_id, candidate_id")
      .eq("id", applicationId)
      .single();

    if (supabaseError) {
      console.error("Error fetching application from Supabase:", supabaseError);
      return { error: supabaseError.message };
    }

    if (!supabaseData) {
      console.error("No data returned for application ID:", applicationId);
      return { error: "No data found" };
    }

    // Fetch job info from Neo4J
    const jobNode = await getJobNode(supabaseData.job_id);

    // Define the specific relationships you want to fetch
    const relationshipsToFetch = [
      "REQUIRES_SKILL",
      "PREFERS_SKILL",
      "SUITABLE_FOR_ROLE",
      "REQUIRED_CERTIFICATION",
    ] as const;

    // Fetch specific job relationships
    const jobRelationships = jobNode
      ? await Promise.all(
          relationshipsToFetch.map(async (relationType) => {
            const nodes = await getJobRelatedNodes(
              supabaseData.job_id,
              relationType
            );
            return { [relationType]: nodes };
          })
        ).then((results) => Object.assign({}, ...results))
      : null;

    // Fetch candidate info from Neo4J
    const candidateNode = await getTalentNodeNoEmbedding(
      supabaseData.candidate_id
    );

    // Define the specific relationships you want to fetch for candidates
    const candidateRelationshipsToFetch = [
      "WORKED_AT",
      "STUDIED_AT",
      "HAS_SKILL",
      "HAS_CERTIFICATION",
    ] as const;

    // Fetch specific candidate relationships
    const candidateRelationships = candidateNode
      ? await Promise.all(
          candidateRelationshipsToFetch.map(async (relationType) => {
            if (isValidRelationshipType(relationType)) {
              const nodes = await getRelationshipNodes(
                supabaseData.candidate_id,
                relationType
              );
              return { [relationType]: nodes };
            }
            console.warn(
              `Unhandled relationship type for candidate: ${relationType}`
            );
            return {};
          })
        ).then((results) => Object.assign({}, ...results))
      : {};

    // Transform the data ensuring everything is serializable
    const transformedData: TransformedApplicationData = {
      applicationInfo: deepSerialize({
        id: supabaseData.id,
        submitDate: supabaseData.created_at,
        status: supabaseData.status,
        resumeKey: supabaseData.resume_id,
      }),
      jobInfo: jobNode
        ? deepSerialize({
            id: Number(jobNode.job_id),
            title: jobNode.job_title || "",
            description: jobNode.summary || "",
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
            relationships: jobRelationships
              ? serializeRelationships(jobRelationships)
              : {},
          })
        : null,
      candidateInfo: candidateNode
        ? deepSerialize({
            id: Number(candidateNode.applicant_id),
            email: candidateNode.email || "",
            name: candidateNode.name || "",
            phone: candidateNode.phone || "",
            city: candidateNode.city || "",
            state: candidateNode.state || "",
            zipcode: candidateNode.zipcode || "",
            relationships: serializeRelationships(candidateRelationships),
          })
        : null,
    };

    console.log("Transformed data:", transformedData);

    return transformedData;
  } catch (error) {
    console.error("Error in getApplicationDetailedView:", error);
    return { error: "An unexpected error occurred" };
  }
}
