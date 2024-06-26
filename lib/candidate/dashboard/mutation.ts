"use server";
import { write, read } from "@/lib/neo4j/utils";
import { Integer, RecordShape } from "neo4j-driver";

// Define interfaces for our data structures
export interface TalentNode {
  applied_at?: string[];
  jds_viewed?: string[];
  city?: string;
  clearance_level?: string;
  resume_matched_to_jd?: string[];
  resume_requested_by_company?: string[];
  interviewed_by?: string[];
  title?: string;
  active_looking?: string;
  zipcode?: string;
  applicant_id: string;
  phone?: string;
  name?: string;
  matching_opt_in?: string;
  company?: string;
  embedding?: number[];
  active_looking_confirmed_date?: string;
  state?: string;
  email?: string;
}

export interface WorkExperienceNode {
  job_title: string;
  organization: string;
  start_date: string;
  end_date?: string;
  responsibilities: string;
  labels: string[];
  _id: number;
}

export interface SkillNode {
  name: string;
  labels: string[];
  _id: number;
}

export interface CertificationNode {
  name: string;
  date_obtained?: string;
  labels: string[];
  _id: number;
}

export interface IndustryNode {
  name: string;
  labels: string[];
  _id: number;
}
export interface RoleNode {
  name: string;
  labels: string[];
  _id: number;
}

export interface SoftSkillNode {
  name: string;
  labels: string[];
  _id: number;
}

type RelationshipType =
  | "WORKED_AT"
  | "HAS_SKILL"
  | "HAS_CERTIFICATION"
  | "HAS_INDUSTRY_EXPERIENCE"
  | "HAS_POTENTIAL_ROLE"
  | "HAS_SOFT_SKILL";

export interface NodeWithId {
  labels: string[];
  _id: number;
  customId?: string;
}

export async function getTalentRelationshipTypes({
  talentId,
}: {
  talentId: string;
}): Promise<RelationshipType[]> {
  const query = `
    MATCH (t:Talent {applicant_id: $talentId})-[r]->()
    RETURN DISTINCT type(r) AS relationshipType
  `;

  try {
    const result = await read(query, { talentId });

    const relationshipTypes = result
      .map((record: RecordShape) => {
        const type = record.relationshipType as RelationshipType;
        if (isValidRelationshipType(type)) {
          return type;
        }
        console.warn(`Unexpected relationship type: ${type}`);
        return null;
      })
      .filter((type): type is RelationshipType => type !== null);

    return relationshipTypes;
  } catch (error) {
    console.error("Error fetching relationship types:", error);
    return [];
  }
}

function isValidRelationshipType(type: string): type is RelationshipType {
  return [
    "WORKED_AT",
    "HAS_SKILL",
    "HAS_CERTIFICATION",
    "HAS_INDUSTRY_EXPERIENCE",
    "HAS_POTENTIAL_ROLE",
    "HAS_SOFT_SKILL",
  ].includes(type);
}

async function getRelationshipNodes<T>(
  applicantId: string,
  relationshipType: RelationshipType
): Promise<(T & NodeWithId)[]> {
  const query = `
    MATCH (t:Talent {applicant_id: $applicantId})-[r:${relationshipType}]->(n)
    RETURN n, ID(n) as nodeId, n.id as customId
  `;

  try {
    const result = await read(query, { applicantId });

    if (!Array.isArray(result)) {
      console.error("Expected result to be an array, but got:", typeof result);
      return [];
    }

    const nodes = result
      .map((record) => {
        if (record && record.n) {
          const neoId =
            record.nodeId instanceof Integer
              ? record.nodeId.toNumber()
              : record.nodeId;
          return {
            ...record.n.properties,
            labels: record.n.labels,
            _id: neoId,
            ...(record.customId && { customId: record.customId }),
          };
        } else {
          console.warn("Unexpected record structure:", record);
          return null;
        }
      })
      .filter((node): node is T & NodeWithId => node !== null);

    return nodes;
  } catch (error) {
    console.error(`Error fetching ${relationshipType} nodes:`, error);
    return [];
  }
}

export async function getTalentWorkExperiences(
  applicantId: string
): Promise<(WorkExperienceNode & NodeWithId)[]> {
  return getRelationshipNodes<WorkExperienceNode>(applicantId, "WORKED_AT");
}

export async function getTalentSkills(
  applicantId: string
): Promise<(SkillNode & NodeWithId)[]> {
  return getRelationshipNodes<SkillNode>(applicantId, "HAS_SKILL");
}

export async function getTalentCertifications(
  applicantId: string
): Promise<(CertificationNode & NodeWithId)[]> {
  return getRelationshipNodes<CertificationNode>(
    applicantId,
    "HAS_CERTIFICATION"
  );
}

export async function getTalentIndustryExperiences(
  applicantId: string
): Promise<(IndustryNode & NodeWithId)[]> {
  return getRelationshipNodes<IndustryNode>(
    applicantId,
    "HAS_INDUSTRY_EXPERIENCE"
  );
}

export async function getTalentPotentialRoles(
  applicantId: string
): Promise<(RoleNode & NodeWithId)[]> {
  return getRelationshipNodes<RoleNode>(applicantId, "HAS_POTENTIAL_ROLE");
}

export async function getTalentSoftSkills(
  applicantId: string
): Promise<(SoftSkillNode & NodeWithId)[]> {
  return getRelationshipNodes<SoftSkillNode>(applicantId, "HAS_SOFT_SKILL");
}

/* CRUD - Update operation utility for any entry with a Neo4j Node ID */
export async function updateNodeProperty<T>({
  nodeId,
  propertyName,
  propertyValue,
}: {
  nodeId: number;
  propertyName: keyof T;
  propertyValue: T[keyof T];
}): Promise<boolean> {
  const query = `
      MATCH (n)
      WHERE ID(n) = $nodeId
      SET n.${String(propertyName)} = $propertyValue
      RETURN n
    `;

  try {
    const result = await write(query, { nodeId, propertyValue });

    if (result && result.length > 0) {
      console.log(
        `Successfully updated ${String(
          propertyName
        )} for node with ID ${nodeId}`
      );
      return true;
    } else {
      console.warn(`No node found with ID ${nodeId}`);
      return false;
    }
  } catch (error) {
    console.error(
      `Error updating ${String(propertyName)} for node with ID ${nodeId}:`,
      error
    );
    throw error;
  }
}

/* CRUD Add / Remove Operations  */
export async function addNewWorkExperience(
  applicantId: string,
  newExperience: Omit<WorkExperienceNode, "_id" | "labels">
): Promise<(WorkExperienceNode & NodeWithId) | null> {
  const query = `
      MATCH (t:Talent {applicant_id: $applicantId})
      CREATE (w:WorkExperience $workExperience)
      CREATE (t)-[:WORKED_AT]->(w)
      RETURN w, ID(w) as nodeId
    `;

  try {
    const result = await write(query, {
      applicantId,
      workExperience: newExperience,
    });

    if (result && result.length > 0) {
      const createdNode = result[0].w;
      const nodeId = result[0].nodeId;
      return {
        ...newExperience,
        labels: ["WorkExperience"],
        _id: nodeId instanceof Integer ? nodeId.toNumber() : nodeId,
      };
    }
    return null;
  } catch (error) {
    console.error("Error adding new work experience:", error);
    throw error;
  }
}

export async function removeWorkExperience(nodeId: number): Promise<boolean> {
    const query = `
      MATCH (w:WorkExperience)
      WHERE ID(w) = $nodeId
      DETACH DELETE w
      RETURN count(w) AS deletedCount
    `;
  
    try {
      const result = await write(query, { nodeId });
      console.log('Remove operation result:', result);
      // Check if any nodes were deleted
      return result && result[0] && result[0].deletedCount > 0;
    } catch (error) {
      console.error("Error removing work experience:", error);
      throw error;
    }
  }