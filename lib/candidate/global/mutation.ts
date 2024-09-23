"use server";
import { write, read } from "@/lib/neo4j/utils";
import { Integer, RecordShape } from "neo4j-driver";

// Define interfaces for our data structures
export interface TalentNode {
  applied_at?: string[];
  jds_viewed?: string[];
  city?: string;
  intro?: string;
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
  labels?: string[];
}

export interface EducationNode {
  degree: string;
  institution: string;
  start_date: string;
  end_date: string;
  honors_awards_coursework?: string;
}

export interface SkillNode {
  name: string;
}

export interface CertificationNode {
  name: string;
  date_obtained?: string;
  issuing_organization?: string;
  expiration_date?: string;
  credential_id?: string;
  credential_url?: string;
}

export interface IndustryNode {
  name: string;
}

export interface RoleNode {
  name: string;
}

export interface SoftSkillNode {
  name: string;
}

export interface ProjectNode {
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  url?: string;
  technologies_used: string[];
  role: string;
  achievements: string[];
}

export interface PublicationNode {
  title: string;
  authors: string[];
  publication_date: string;
  journal_or_conference: string;
  doi?: string;
  url?: string;
  abstract?: string;
  citations?: number;
}

export interface NodeWithId {
  labels: string[];
  _id: number;
  customId?: string;
}

type RelationshipType =
  | "WORKED_AT"
  | "STUDIED_AT"
  | "HAS_SKILL"
  | "HAS_CERTIFICATION"
  | "HAS_INDUSTRY_EXPERIENCE"
  | "HAS_POTENTIAL_ROLE"
  | "HAS_SOFT_SKILL"
  | "WORKED_ON"
  | "SUBMITTED"
  | "AUTHORED";

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
    "STUDIED_AT",
    "HAS_SKILL",
    "HAS_CERTIFICATION",
    "HAS_INDUSTRY_EXPERIENCE",
    "HAS_POTENTIAL_ROLE",
    "HAS_SOFT_SKILL",
    "WORKED_ON",
    "AUTHORED",
   "SUBMITTED"
  ].includes(type);
}

export async function getRelationshipNodes<T>(
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

export async function getTalentEducation(
  applicantId: string
): Promise<(EducationNode & NodeWithId)[]> {
  return getRelationshipNodes<EducationNode>(applicantId, "STUDIED_AT");
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

export async function getTalentProjects(
  applicantId: string
): Promise<(ProjectNode & NodeWithId)[]> {
  return getRelationshipNodes<ProjectNode>(applicantId, "WORKED_ON");
}

export async function getTalentPublications(
  applicantId: string
): Promise<(PublicationNode & NodeWithId)[]> {
  return getRelationshipNodes<PublicationNode>(applicantId, "AUTHORED");
}

/* CRUD - Create operation for Talent node */
export async function createTalentNode(
  talentData: TalentNode
): Promise<(TalentNode & NodeWithId) | null> {
  const query = `
    CREATE (t:Talent $talentData)
    RETURN t, ID(t) as nodeId
  `;

  try {
    const result = await write(query, { talentData });
    if (result && result.length > 0) {
      const createdNode = result[0].t;
      const nodeId = result[0].nodeId;
      return {
        ...createdNode.properties,
        labels: ["Talent"],
        _id: nodeId instanceof Integer ? nodeId.toNumber() : nodeId,
      };
    }
    return null;
  } catch (error) {
    console.error("Error creating new Talent node:", error);
    throw error;
  }
}

/* CRUD - Read operation for Talent node */
export async function getTalentNode(
  applicantId: string
): Promise<(TalentNode & NodeWithId) | null> {
  const query = `
    MATCH (t:Talent {applicant_id: $applicantId})
    RETURN t, ID(t) as nodeId
  `;

  try {
    const result = await read(query, { applicantId });
    if (result && result.length > 0) {
      const talentNode = result[0].t;
      const nodeId = result[0].nodeId;
      return {
        ...talentNode.properties,
        labels: ["Talent"],
        _id: nodeId instanceof Integer ? nodeId.toNumber() : nodeId,
      };
    }
    return null;
  } catch (error) {
    console.error("Error retrieving Talent node:", error);
    throw error;
  }
}

export async function getTalentEmbedding(applicantId: string): Promise<number[] | null> {
  const query = `
    MATCH (t:Talent {applicant_id: $applicantId})
    RETURN t.embedding AS embedding
  `;

  try {
    const result = await read(query, { applicantId });
    if (result && result.length > 0) {
      return result[0].embedding;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving Talent embedding:", error);
    throw error;
  }
}


export async function getTalentNodeNoEmbedding(
  applicantId: string
): Promise<(Omit<TalentNode, "embedding"> & NodeWithId) | null> {
  const query = `
    MATCH (t:Talent {applicant_id: $applicantId})
    RETURN {
      city: t.city,
      clearance_level: t.clearance_level,
      title: t.title,
      intro: t.intro,
      active_looking: t.active_looking,
      zipcode: t.zipcode,
      applicant_id: t.applicant_id,
      phone: t.phone,
      name: t.name,
      matching_opt_in: t.matching_opt_in,
      company: t.company,
      active_looking_confirmed_date: t.active_looking_confirmed_date,
      state: t.state,
      email: t.email
    } as talentData,
    ID(t) as nodeId
  `;

  try {
    const result = await read(query, { applicantId });
    if (result && result.length > 0) {
      const talentData = result[0].talentData;
      const nodeId = result[0].nodeId;
      return {
        ...talentData,
        labels: ["Talent"],
        _id: nodeId instanceof Integer ? nodeId.toNumber() : nodeId,
      };
    }
    return null;
  } catch (error) {
    console.error("Error retrieving Talent node:", error);
    throw error;
  }
}

/* CRUD - Update operation for any node property */
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
      /* console.log(
        `Successfully updated ${String(
          propertyName
        )} for node with ID ${nodeId}`
      ); */
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

/* CRUD - Delete operation for Talent node */
export async function deleteTalentNode(applicantId: string): Promise<boolean> {
  const query = `
    MATCH (t:Talent {applicant_id: $applicantId})
    DETACH DELETE t
    RETURN count(t) AS deletedCount
  `;

  try {
    const result = await write(query, { applicantId });
    return result && result[0] && result[0].deletedCount > 0;
  } catch (error) {
    console.error("Error deleting Talent node:", error);
    throw error;
  }
}

/* CRUD - Add/Remove Project */
export async function addProject(
  applicantId: string,
  projectData: ProjectNode
): Promise<(ProjectNode & NodeWithId) | null> {
  return addRelationship<ProjectNode>(
    applicantId,
    "Project",
    projectData,
    "WORKED_ON"
  );
}

export async function removeProject(nodeId: number): Promise<boolean> {
  return removeRelationship(nodeId, "Project");
}

/* CRUD - Add/Remove Publication */
export async function addPublication(
  applicantId: string,
  publicationData: PublicationNode
): Promise<(PublicationNode & NodeWithId) | null> {
  return addRelationship<PublicationNode>(
    applicantId,
    "Publication",
    publicationData,
    "AUTHORED"
  );
}

export async function removePublication(nodeId: number): Promise<boolean> {
  return removeRelationship(nodeId, "Publication");
}

/* Helper function to add a relationship */
async function addRelationship<T>(
  applicantId: string,
  nodeLabel: string,
  nodeProperties: T,
  relationshipType: RelationshipType
): Promise<(T & NodeWithId) | null> {
  const query = `
    MATCH (t:Talent {applicant_id: $applicantId})
    CREATE (n:${nodeLabel} $nodeProperties)
    CREATE (t)-[:${relationshipType}]->(n)
    RETURN n, ID(n) as nodeId
  `;

  try {
    const result = await write(query, { applicantId, nodeProperties });
    if (result && result.length > 0) {
      const createdNode = result[0].n;
      const nodeId = result[0].nodeId;
      return {
        ...nodeProperties,
        labels: [nodeLabel],
        _id: nodeId instanceof Integer ? nodeId.toNumber() : nodeId,
      };
    }
    return null;
  } catch (error) {
    console.error(`Error adding ${nodeLabel}:`, error);
    throw error;
  }
}

/* Helper function to remove a relationship */
async function removeRelationship(
  nodeId: number,
  nodeLabel: string
): Promise<boolean> {
  const query = `
    MATCH (n:${nodeLabel})
    WHERE ID(n) = $nodeId
    DETACH DELETE n
    RETURN count(n) AS deletedCount
  `;

  try {
    const result = await write(query, { nodeId });
    return result && result[0] && result[0].deletedCount > 0;
  } catch (error) {
    console.error(`Error removing ${nodeLabel}:`, error);
    throw error;
  }
}

/* CRUD - Add/Remove Work Experience */
export async function addNewWorkExperience(
  applicantId: string,
  newExperience: WorkExperienceNode
): Promise<(WorkExperienceNode & NodeWithId) | null> {
  return addRelationship<WorkExperienceNode>(
    applicantId,
    "WorkExperience",
    newExperience,
    "WORKED_AT"
  );
}

export async function removeWorkExperience(nodeId: number): Promise<boolean> {
  return removeRelationship(nodeId, "WorkExperience");
}

/* CRUD - Add/Remove Education */
export async function addEducation(
  applicantId: string,
  educationData: EducationNode
): Promise<(EducationNode & NodeWithId) | null> {
  return addRelationship<EducationNode>(
    applicantId,
    "Education",
    educationData,
    "STUDIED_AT"
  );
}

export async function removeEducation(nodeId: number): Promise<boolean> {
  return removeRelationship(nodeId, "Education");
}

/* CRUD - Add/Remove Skill */
export async function addSkill(
  applicantId: string,
  skillData: SkillNode
): Promise<(SkillNode & NodeWithId) | null> {
  return addRelationship<SkillNode>(
    applicantId,
    "Skill",
    skillData,
    "HAS_SKILL"
  );
}

export async function removeSkill(nodeId: number): Promise<boolean> {
  return removeRelationship(nodeId, "Skill");
}

/* CRUD - Add/Remove Certification */
export async function addCertification(
  applicantId: string,
  certificationData: CertificationNode
): Promise<(CertificationNode & NodeWithId) | null> {
  return addRelationship<CertificationNode>(
    applicantId,
    "Certification",
    certificationData,
    "HAS_CERTIFICATION"
  );
}

export async function removeCertification(nodeId: number): Promise<boolean> {
  return removeRelationship(nodeId, "Certification");
}

/* CRUD - Add/Remove Industry Experience */
export async function addIndustryExperience(
  applicantId: string,
  industryData: IndustryNode
): Promise<(IndustryNode & NodeWithId) | null> {
  return addRelationship<IndustryNode>(
    applicantId,
    "Industry",
    industryData,
    "HAS_INDUSTRY_EXPERIENCE"
  );
}

export async function removeIndustryExperience(
  nodeId: number
): Promise<boolean> {
  return removeRelationship(nodeId, "Industry");
}

/* CRUD - Add/Remove Soft Skill */
export async function addSoftSkill(
  applicantId: string,
  softSkillData: SoftSkillNode
): Promise<(SoftSkillNode & NodeWithId) | null> {
  return addRelationship<SoftSkillNode>(
    applicantId,
    "SoftSkill",
    softSkillData,
    "HAS_SOFT_SKILL"
  );
}

export async function removeSoftSkill(nodeId: number): Promise<boolean> {
  return removeRelationship(nodeId, "SoftSkill");
}

/* CRUD - Add/Remove Potential Role */
export async function addPotentialRole(
  applicantId: string,
  roleData: RoleNode
): Promise<(RoleNode & NodeWithId) | null> {
  return addRelationship<RoleNode>(
    applicantId,
    "Role",
    roleData,
    "HAS_POTENTIAL_ROLE"
  );
}

export async function removePotentialRole(nodeId: number): Promise<boolean> {
  return removeRelationship(nodeId, "Role");
}
