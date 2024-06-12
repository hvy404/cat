export type JobDescription = {
  jobTitle: string;
  company: string;
  client?: string;
  skills: string[];
  jobType: string;
  benefits?: string[];
  locationType?: "remote" | "onsite" | "hybrid";
  location?: { city?: string; state?: string; zipcode?: string }[];
  experience?: string;
  description?: string;
  salaryRange?: {
    maximumSalary: number;
    startingSalary: number;
  };
  qualifications?: string[];
  companyOverview?: string;
  preferredSkills: string[];
  responsibilities: string[];
  securityClearance?: "none" | "basic" | "secret" | "top-secret";
  applicationDeadline?: string;
  technicalDemand?: string;
  clientInteraction?: boolean;
  embedding?: number[];
  remoteFlexibility?: boolean;
  suitablePastRoles?: string[];
  advancementPotential?: boolean;
  leadershipOpportunity?: boolean;
  commissionPay?: boolean;
  commissionPercent?: number;
  oteSalary?: number;
  education?: string[];
  certifications?: string[];
};

// Helper function to format the embedding array
function formatArrayForCypher(array: number[]) {
  return `[${array.join(", ")}]`; // Adds a space after each comma
}

// Helper function to escape double quotes in strings
function escapeString(str: string = ""): string { 
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function generateJobCypherQuery(
  jd: JobDescription,
  jobDescriptionId: string,
  employerId: string
): string {
  let cypher = `
    CREATE (j:Job {
      job_title: "${escapeString(jd.jobTitle)}",  
      job_id: "${jobDescriptionId}",  
      employer_id: "${employerId}",
      embedding: ${jd.embedding ? formatArrayForCypher(jd.embedding) : "[]"},
      client: "${escapeString(jd.client || "")}",  
      company: "${escapeString(jd.company)}",      
      job_type: "${escapeString(jd.jobType)}",   
      location_type: "${escapeString(jd.locationType || "unspecified")}", 
      location: "${escapeString(JSON.stringify(jd.location || []))}",    
      experience: "${escapeString(jd.experience || "")}", 
      description: "${escapeString(jd.description || "")}",      
      maximum_salary: ${jd.salaryRange?.maximumSalary ?? "null"}, 
      starting_salary: ${jd.salaryRange?.startingSalary ?? "null"}, 
      company_overview: "${escapeString(jd.companyOverview || "")}", 
      security_clearance: "${escapeString(jd.securityClearance || "none")}", 
      application_deadline: "${escapeString(jd.applicationDeadline || "")}", 
      technical_demand: "${escapeString(jd.technicalDemand || "")}", 
      client_interaction: ${jd.clientInteraction ?? "null"}, 
      remote_flexibility: ${jd.remoteFlexibility ?? "null"}, 
      advancement_potential: ${jd.advancementPotential ?? "null"}, 
      leadership_opportunity: ${jd.leadershipOpportunity ?? "null"},
      commission_pay: ${jd.commissionPay ?? "null"},
      commission_percent: ${jd.commissionPercent ?? "null"},
      ote_salary: ${jd.oteSalary ?? "null"}
    })
    WITH j`;

  // Append relationships for arrays
  cypher += appendArrayNodes(jd.skills, "Skill", "REQUIRES_SKILL", true);
  cypher += appendArrayNodes(jd.benefits, "Benefit", "OFFERS_BENEFIT", true);
  cypher += appendArrayNodes(jd.qualifications, "Qualification", "REQUIRES_QUALIFICATION", true);
  cypher += appendArrayNodes(jd.preferredSkills, "Skill", "PREFERS_SKILL", true);
  cypher += appendArrayNodes(jd.responsibilities, "Responsibility", "HAS_RESPONSIBILITY", true);
  cypher += appendArrayNodes(jd.suitablePastRoles, "Role", "SUITABLE_FOR_ROLE", true);
  cypher += appendArrayNodes(jd.education, "Education", "REQUIRES_EDUCATION", false);
  cypher += appendArrayNodes(jd.certifications, "Certification", "REQUIRES_CERTIFICATION", false);

  cypher += `\nRETURN j;`;

  return cypher;
}

function appendArrayNodes(
  items: string[] | undefined,
  label: string,
  relationship: string,
  ensureEmpty: boolean
): string {
  let cypherPart = "";
  if (items && items.length > 0) {
    cypherPart += `
  UNWIND ${JSON.stringify(items.map(escapeString))} AS item
  MERGE (n:${label} {name: item})
  MERGE (j)-[:${relationship}]->(n)
  WITH j`;
  } else if (ensureEmpty) {
    cypherPart += `
  // Ensure relationship even if empty
  WITH j`;
  }
  return cypherPart;
}