"use server";
import { write, read } from "@/lib/neo4j/utils";
import { Integer, RecordShape } from "neo4j-driver";

export interface JobNode {
  job_title: string;
  job_id: string;
  author: string; // Changed from employer_id to match the Neo4j structure
  employer_id: string; // Added to match the Neo4j structure
  embedding: number[];
  company?: string; // Made optional as it's not clear if it's always present
  job_type: string;
  location_type: string;
  location: Array<{ city: string; state: string; zipcode: string }>; // Changed to parsed array of objects
  experience: string;
  summary: string;
  maximum_salary: number | null;
  starting_salary: number | null;
  qualifications: string[];
  company_overview: string;
  security_clearance?: string;
  education: string[];
  remote_flexibility: boolean | null;
  leadership_opportunity: boolean | null;
  commission_pay: boolean | null;
  commission_percent: number | null;
  ote_salary: number | null;
  salary_disclose: boolean | null;
  compensation_type: string;
  hourly_comp_min: number | null;
  hourly_comp_max: number | null;
  private_employer: boolean | null;
  benefits: string[];
  responsibilities: string[];
}

export interface SkillNode {
  name: string;
}

export interface BenefitNode {
  name: string;
}

export interface QualificationNode {
  name: string;
}

export interface ResponsibilityNode {
  description: string;
}

export interface RoleNode {
  name: string;
}

export interface EducationNode {
  degree: string;
  field?: string;
}

export interface CertificationNode {
  name: string;
}

export interface AlternativeTitleNode {
  name: string;
}

export interface NodeWithId {
  labels: string[];
  _id: number;
  customId?: string;
}

export interface CompanyNode {
  id: string;
  name: string;
  website?: string;
  manager?: string;
  contactEmail?: string;
  description?: string;
  admin?: string[];
  industry?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  foundedYear?: string;
  headquarters?: {
    city?: string;
    state?: string;
    country?: string;
  };
  phoneNumber?: string;
  size?: string;
  hasLogo?: boolean;
}

export type RelationshipType =
  | "REQUIRES_SKILL"
  | "OFFERS_BENEFIT"
  | "REQUIRES_QUALIFICATION"
  | "PREFERS_SKILL"
  | "SUITABLE_FOR_ROLE"
  | "REQUIRED_EDUCATION"
  | "REQUIRED_CERTIFICATION"
  | "HAS_ALTERNATIVE_TITLE"
  | "SUBMITTED"
  | "POSTED_BY";

export async function getJobRelationshipTypes({
  jobId,
}: {
  jobId: string;
}): Promise<RelationshipType[]> {
  const query = `
    MATCH (j:Job {job_id: $jobId})-[r]->()
    RETURN DISTINCT type(r) AS relationshipType
  `;

  try {
    const result = await read(query, { jobId });

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
    "REQUIRES_SKILL",
    "OFFERS_BENEFIT",
    "REQUIRES_QUALIFICATION",
    "PREFERS_SKILL",
    "SUITABLE_FOR_ROLE",
    "REQUIRED_EDUCATION",
    "REQUIRED_CERTIFICATION",
    "HAS_ALTERNATIVE_TITLE",
    "POSTED_BY",
  ].includes(type);
}

export async function getRelationshipNodes<T>(
  jobId: string,
  relationshipType: RelationshipType
): Promise<(T & NodeWithId)[]> {
  const query = `
    MATCH (j:Job {job_id: $jobId})-[r:${relationshipType}]->(n)
    RETURN n, ID(n) as nodeId, n.id as customId
  `;

  try {
    const result = await read(query, { jobId });

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

export async function getJobRequiredSkills(
  jobId: string
): Promise<(SkillNode & NodeWithId)[]> {
  return getRelationshipNodes<SkillNode>(jobId, "REQUIRES_SKILL");
}

export async function getJobBenefits(
  jobId: string
): Promise<(BenefitNode & NodeWithId)[]> {
  return getRelationshipNodes<BenefitNode>(jobId, "OFFERS_BENEFIT");
}

export async function getJobQualifications(
  jobId: string
): Promise<(QualificationNode & NodeWithId)[]> {
  return getRelationshipNodes<QualificationNode>(
    jobId,
    "REQUIRES_QUALIFICATION"
  );
}

export async function getJobPreferredSkills(
  jobId: string
): Promise<(SkillNode & NodeWithId)[]> {
  return getRelationshipNodes<SkillNode>(jobId, "PREFERS_SKILL");
}

export async function getJobSuitableRoles(
  jobId: string
): Promise<(RoleNode & NodeWithId)[]> {
  return getRelationshipNodes<RoleNode>(jobId, "SUITABLE_FOR_ROLE");
}

export async function getJobRequiredEducation(
  jobId: string
): Promise<(EducationNode & NodeWithId)[]> {
  return getRelationshipNodes<EducationNode>(jobId, "REQUIRED_EDUCATION");
}

export async function getJobRequiredCertifications(
  jobId: string
): Promise<(CertificationNode & NodeWithId)[]> {
  return getRelationshipNodes<CertificationNode>(
    jobId,
    "REQUIRED_CERTIFICATION"
  );
}

export async function getJobAlternativeTitles(
  jobId: string
): Promise<(AlternativeTitleNode & NodeWithId)[]> {
  return getRelationshipNodes<AlternativeTitleNode>(
    jobId,
    "HAS_ALTERNATIVE_TITLE"
  );
}

/* CRUD - Create operation for Job node */
export async function createJobNode(
  jobData: JobNode
): Promise<(JobNode & NodeWithId) | null> {
  const query = `
    CREATE (j:Job $jobData)
    RETURN j, ID(j) as nodeId
  `;

  try {
    const result = await write(query, { jobData });
    if (result && result.length > 0) {
      const createdNode = result[0].j;
      const nodeId = result[0].nodeId;
      return {
        ...createdNode.properties,
        labels: ["Job"],
        _id: nodeId instanceof Integer ? nodeId.toNumber() : nodeId,
      };
    }
    return null;
  } catch (error) {
    console.error("Error creating new Job node:", error);
    throw error;
  }
}

/* CRUD - Read operation for Job node */
export async function getJobNode(
  jobId: string
): Promise<(Omit<JobNode, "embedding"> & NodeWithId & { companyId?: string }) | null> {
  const query = `
    MATCH (j:Job {job_id: $jobId})
    OPTIONAL MATCH (j)-[:POSTED_BY]->(c:Company)
    RETURN j {
      .*, 
      embedding: null,
      companyId: c.id
    } AS j, ID(j) as nodeId
  `;

  try {
    const result = await read(query, { jobId });
    if (result && result.length > 0) {
      const jobNode = result[0].j;
      const nodeId = result[0].nodeId;

      // Define all required properties of JobNode (except embedding)
      const requiredProps: (keyof Omit<JobNode, "embedding">)[] = [
        "job_title",
        "job_id",
        "employer_id",
        "company",
        "job_type",
        "location_type",
        "education",
        "location",
        "experience",
        "summary",
        "maximum_salary",
        "starting_salary",
        "qualifications",
        "company_overview",
        "security_clearance",
        "remote_flexibility",
        "leadership_opportunity",
        "commission_pay",
        "commission_percent",
        "ote_salary",
        "salary_disclose",
        "compensation_type",
        "hourly_comp_min",
        "hourly_comp_max",
        "private_employer",
        "benefits",
        "responsibilities",
      ];

      // Create an object with all required properties
      const serializedNode = requiredProps.reduce<
        Partial<Omit<JobNode, "embedding">>
      >((acc, prop) => {
        const value = jobNode[prop];
        if (prop === "responsibilities" || prop === "benefits" || prop === "qualifications" || prop === "education") {
          // Ensure these properties are always arrays
          acc[prop] = Array.isArray(value) ? value : (value ? [value] : []);
        } else if (prop === "location") {
          // Parse the location JSON string
          acc[prop] = value ? JSON.parse(value) : [];
        } else {
          acc[prop] =
            value instanceof Integer ? value.toNumber() : value ?? null;
        }
        return acc;
      }, {});

      // Add NodeWithId properties and companyId
      const finalNode: Omit<JobNode, "embedding"> & NodeWithId & { companyId?: string } = {
        ...(serializedNode as Omit<JobNode, "embedding">),
        labels: ["Job"],
        _id: nodeId instanceof Integer ? nodeId.toNumber() : nodeId,
        companyId: jobNode.companyId || undefined,
      };

      return finalNode;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving Job node:", error);
    throw error;
  }
}

/* CRUD - Delete operation for Job node */
export async function deleteJobNode(jobId: string): Promise<boolean> {
  const query = `
    MATCH (j:Job {job_id: $jobId})
    DETACH DELETE j
    RETURN count(j) AS deletedCount
  `;

  try {
    const result = await write(query, { jobId });
    return result && result[0] && result[0].deletedCount > 0;
  } catch (error) {
    console.error("Error deleting Job node:", error);
    throw error;
  }
}

/* Helper function to add a relationship */
async function addRelationship<T>(
  jobId: string,
  nodeLabel: string,
  nodeProperties: T,
  relationshipType: RelationshipType
): Promise<(T & NodeWithId) | null> {
  const query = `
    MATCH (j:Job {job_id: $jobId})
    MERGE (n:${nodeLabel} $nodeProperties)
    MERGE (j)-[:${relationshipType}]->(n)
    RETURN n, ID(n) as nodeId
  `;

  try {
    const result = await write(query, { jobId, nodeProperties });
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
    MATCH (j:Job)-[r]->(n:${nodeLabel})
    WHERE ID(n) = $nodeId
    DELETE r
    RETURN count(r) AS deletedCount
  `;

  try {
    const result = await write(query, { nodeId });
    return result && result[0] && result[0].deletedCount > 0;
  } catch (error) {
    console.error(`Error removing ${nodeLabel} relationship:`, error);
    throw error;
  }
}

/* CRUD - Add/Remove Required Skill */
export async function addRequiredSkill(
  jobId: string,
  skillData: SkillNode
): Promise<(SkillNode & NodeWithId) | null> {
  return addRelationship<SkillNode>(
    jobId,
    "Skill",
    skillData,
    "REQUIRES_SKILL"
  );
}

export async function removeRequiredSkill(nodeId: number): Promise<boolean> {
  return removeRelationship(nodeId, "Skill");
}

/* CRUD - Add/Remove Benefit */
export async function addBenefit(
  jobId: string,
  benefitData: BenefitNode
): Promise<(BenefitNode & NodeWithId) | null> {
  return addRelationship<BenefitNode>(
    jobId,
    "Benefit",
    benefitData,
    "OFFERS_BENEFIT"
  );
}

export async function removeBenefit(nodeId: number): Promise<boolean> {
  return removeRelationship(nodeId, "Benefit");
}

/* CRUD - Add/Remove Qualification */
export async function addQualification(
  jobId: string,
  qualificationData: QualificationNode
): Promise<(QualificationNode & NodeWithId) | null> {
  return addRelationship<QualificationNode>(
    jobId,
    "Qualification",
    qualificationData,
    "REQUIRES_QUALIFICATION"
  );
}

export async function removeQualification(nodeId: number): Promise<boolean> {
  return removeRelationship(nodeId, "Qualification");
}

/* CRUD - Add/Remove Preferred Skill */
export async function addPreferredSkill(
  jobId: string,
  skillData: SkillNode
): Promise<(SkillNode & NodeWithId) | null> {
  return addRelationship<SkillNode>(jobId, "Skill", skillData, "PREFERS_SKILL");
}

export async function removePreferredSkill(nodeId: number): Promise<boolean> {
  return removeRelationship(nodeId, "Skill");
}

export async function addSuitableRole(
  jobId: string,
  roleData: RoleNode
): Promise<(RoleNode & NodeWithId) | null> {
  return addRelationship<RoleNode>(
    jobId,
    "Role",
    roleData,
    "SUITABLE_FOR_ROLE"
  );
}

export async function removeSuitableRole(nodeId: number): Promise<boolean> {
  return removeRelationship(nodeId, "Role");
}

/* CRUD - Add/Remove Required Education */
export async function addRequiredEducation(
  jobId: string,
  educationData: EducationNode
): Promise<(EducationNode & NodeWithId) | null> {
  return addRelationship<EducationNode>(
    jobId,
    "Education",
    educationData,
    "REQUIRED_EDUCATION"
  );
}

export async function removeRequiredEducation(
  nodeId: number
): Promise<boolean> {
  return removeRelationship(nodeId, "Education");
}

/* CRUD - Add/Remove Required Certification */
export async function addRequiredCertification(
  jobId: string,
  certificationData: CertificationNode
): Promise<(CertificationNode & NodeWithId) | null> {
  return addRelationship<CertificationNode>(
    jobId,
    "Certification",
    certificationData,
    "REQUIRED_CERTIFICATION"
  );
}

export async function removeRequiredCertification(
  nodeId: number
): Promise<boolean> {
  return removeRelationship(nodeId, "Certification");
}

/* CRUD - Add/Remove Alternative Title */
export async function addAlternativeTitle(
  jobId: string,
  titleData: AlternativeTitleNode
): Promise<(AlternativeTitleNode & NodeWithId) | null> {
  return addRelationship<AlternativeTitleNode>(
    jobId,
    "AlternativeTitle",
    titleData,
    "HAS_ALTERNATIVE_TITLE"
  );
}

export async function removeAlternativeTitle(nodeId: number): Promise<boolean> {
  return removeRelationship(nodeId, "AlternativeTitle");
}

// Get the company that posted the job
export async function getJobPostedByCompany(
  jobId: string
): Promise<(NodeWithId & CompanyNode) | null> {
  const query = `
    MATCH (j:Job {job_id: $jobId})-[:POSTED_BY]->(c:Company)
    RETURN c, ID(c) as nodeId
  `;

  try {
    const result = await read(query, { jobId });
    if (result && result.length > 0) {
      const company = result[0].c;
      const nodeId = result[0].nodeId;
      return {
        ...company.properties,
        socialMedia: JSON.parse(company.properties.socialMedia || '{}'),
        headquarters: JSON.parse(company.properties.headquarters || '{}'),
        admin: JSON.parse(company.properties.admin || '[]'),
        labels: ["Company"],
        _id: nodeId instanceof Integer ? nodeId.toNumber() : nodeId,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching company that posted the job:", error);
    return null;
  }
}


/* Utility function to get all relationships for a Job */
export async function getAllJobRelationships(
  jobId: string
): Promise<Record<RelationshipType, (NodeWithId & Record<string, any>)[]>> {
  const relationshipTypes = await getJobRelationshipTypes({ jobId });
  const relationships: Record<
    RelationshipType,
    (NodeWithId & Record<string, any>)[]
  > = {} as any;

  for (const type of relationshipTypes) {
    switch (type) {
      case "REQUIRES_SKILL":
        relationships[type] = await getJobRequiredSkills(jobId);
        break;
      case "OFFERS_BENEFIT":
        relationships[type] = await getJobBenefits(jobId);
        break;
      case "REQUIRES_QUALIFICATION":
        relationships[type] = await getJobQualifications(jobId);
        break;
      case "PREFERS_SKILL":
        relationships[type] = await getJobPreferredSkills(jobId);
        break;
      case "SUITABLE_FOR_ROLE":
        relationships[type] = await getJobSuitableRoles(jobId);
        break;
      case "REQUIRED_EDUCATION":
        relationships[type] = await getJobRequiredEducation(jobId);
        break;
      case "REQUIRED_CERTIFICATION":
        relationships[type] = await getJobRequiredCertifications(jobId);
        break;
      case "HAS_ALTERNATIVE_TITLE":
        relationships[type] = await getJobAlternativeTitles(jobId);
        break;
      case "POSTED_BY":
        const company = await getJobPostedByCompany(jobId);
        relationships[type] = company ? [company] : [];
        break;
    }
  }

  return relationships;
}

/* Utility function to update multiple properties of a Job node */
export async function updateJobProperties(
  jobId: string,
  properties: Partial<JobNode>
): Promise<boolean> {
  const query = `
    MATCH (j:Job {job_id: $jobId})
    SET j += $properties
    RETURN j
  `;

  try {
    const result = await write(query, { jobId, properties });
    return result && result.length > 0;
  } catch (error) {
    console.error("Error updating Job properties:", error);
    throw error;
  }
}

/* Utility function to search for Jobs based on criteria */
export async function searchJobs(
  criteria: Partial<JobNode>
): Promise<(JobNode & NodeWithId)[]> {
  let whereClause = Object.entries(criteria)
    .map(([key, value]) => {
      if (typeof value === "string") {
        return `j.${key} =~ '(?i).*${value}.*'`; // Case-insensitive partial match for strings
      } else {
        return `j.${key} = $${key}`;
      }
    })
    .join(" AND ");

  const query = `
    MATCH (j:Job)
    WHERE ${whereClause}
    RETURN j, ID(j) as nodeId
  `;

  try {
    const result = await read(query, criteria);
    return result.map((record: any) => ({
      ...record.j.properties,
      labels: ["Job"],
      _id:
        record.nodeId instanceof Integer
          ? record.nodeId.toNumber()
          : record.nodeId,
    }));
  } catch (error) {
    console.error("Error searching for Jobs:", error);
    throw error;
  }
}

/* Utility function to get similar Jobs based on embedding */
export async function getSimilarJobs(
  jobId: string,
  limit: number = 5
): Promise<(JobNode & NodeWithId)[]> {
  const query = `
    MATCH (j1:Job {job_id: $jobId})
    MATCH (j2:Job)
    WHERE j1 <> j2
    WITH j1, j2, gds.similarity.cosine(j1.embedding, j2.embedding) AS similarity
    ORDER BY similarity DESC
    LIMIT $limit
    RETURN j2, ID(j2) as nodeId, similarity
  `;

  try {
    const result = await read(query, { jobId, limit });
    return result.map((record: any) => ({
      ...record.j2.properties,
      labels: ["Job"],
      _id:
        record.nodeId instanceof Integer
          ? record.nodeId.toNumber()
          : record.nodeId,
      similarity: record.similarity,
    }));
  } catch (error) {
    console.error("Error getting similar Jobs:", error);
    throw error;
  }
}

/* Utility function to get Jobs by employer */
export async function getJobsByEmployer(
  employerId: string
): Promise<(JobNode & NodeWithId)[]> {
  const query = `
    MATCH (j:Job {employer_id: $employerId})
    RETURN j, ID(j) as nodeId
  `;

  try {
    const result = await read(query, { employerId });
    return result.map((record: any) => ({
      ...record.j.properties,
      labels: ["Job"],
      _id:
        record.nodeId instanceof Integer
          ? record.nodeId.toNumber()
          : record.nodeId,
    }));
  } catch (error) {
    console.error("Error getting Jobs by employer:", error);
    throw error;
  }
}

/* Utility function to get job count by various criteria */
export async function getJobCount(criteria: {
  byEmployer?: string;
  byJobType?: string;
  byLocation?: string;
  bySalaryRange?: { min: number; max: number };
}): Promise<number> {
  let whereClause = [];
  if (criteria.byEmployer) whereClause.push("j.employer_id = $employerId");
  if (criteria.byJobType) whereClause.push("j.job_type = $jobType");
  if (criteria.byLocation) whereClause.push("j.location CONTAINS $location");
  if (criteria.bySalaryRange)
    whereClause.push(
      "j.starting_salary >= $minSalary AND j.maximum_salary <= $maxSalary"
    );

  const query = `
    MATCH (j:Job)
    ${whereClause.length > 0 ? "WHERE " + whereClause.join(" AND ") : ""}
    RETURN count(j) as jobCount
  `;

  try {
    const result = await read(query, {
      employerId: criteria.byEmployer,
      jobType: criteria.byJobType,
      location: criteria.byLocation,
      minSalary: criteria.bySalaryRange?.min,
      maxSalary: criteria.bySalaryRange?.max,
    });
    return result[0].jobCount.low;
  } catch (error) {
    console.error("Error getting job count:", error);
    throw error;
  }
}
