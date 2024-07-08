/**
 * Generates a Cypher query string for creating a Job node in the database.
 * @param jd - The JobDescription object containing the job details.
 * @param jobDescriptionId - The ID of the job description.
 * @param employerId - The ID of the employer.
 * @returns The Cypher query string.
 */

// GOOD VERSION

export type JobDescription = {
  jobTitle: string;
  salaryDisclose?: boolean;
  compensationType?: string;
  hourlyCompMin?: number;
  hourlyCompMax?: number;
  privateEmployer?: boolean;
  company: string;
  skills: string[];
  jobType: string;
  benefits?: string[];
  locationType?: "remote" | "onsite" | "hybrid";
  location?: { city?: string; state?: string; zipcode?: string }[];
  experience?: string;
  summary?: string;
  salaryRange?: {
    maximumSalary: number;
    startingSalary: number;
  };
  qualifications?: string[];
  companyOverview?: string;
  preferredSkills: string[];
  responsibilities: string[];
  clearanceLevel?: "none" | "basic" | "elevated" | "high";
  technicalDemand?: string;
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
  maxSalary?: number;
  minSalary?: number;
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
  employerId: string,
  companyId: string
): string {
  // Create the Job node

  let cypher = `
    CREATE (j:Job {
      job_title: "${escapeString(jd.jobTitle)}",  
      job_id: "${jobDescriptionId}",  
      author: "${employerId}",
      embedding: ${jd.embedding ? formatArrayForCypher(jd.embedding) : "[]"},
      company: "${escapeString(jd.company)}",      
      job_type: "${escapeString(jd.jobType)}",   
      location_type: "${escapeString(jd.locationType || "unspecified")}", 
      location: "${escapeString(JSON.stringify(jd.location || []))}",    
      experience: "${escapeString(jd.experience || "")}", 
      summary: "${escapeString(jd.summary || "")}",      
      maximum_salary: ${jd.maxSalary ?? "null"}, 
      starting_salary: ${jd.minSalary ?? "null"}, 
      company_overview: "${escapeString(jd.companyOverview || "")}", 
      security_clearance: "${escapeString(jd.clearanceLevel || "none")}", 
      technical_demand: "${escapeString(jd.technicalDemand || "")}", 
      remote_flexibility: ${jd.remoteFlexibility ?? "null"}, 
      advancement_potential: ${jd.advancementPotential ?? "null"}, 
      leadership_opportunity: ${jd.leadershipOpportunity ?? "null"},
      commission_pay: ${jd.commissionPay ?? "null"},
      commission_percent: ${jd.commissionPercent ?? "null"},
      ote_salary: ${jd.oteSalary ?? "null"},
      salary_disclose: ${jd.salaryDisclose ?? "null"},
      compensation_type: "${escapeString(jd.compensationType || "")}",
      hourly_comp_min: ${jd.hourlyCompMin ?? "null"},
      hourly_comp_max: ${jd.hourlyCompMax ?? "null"},
      private_employer: ${jd.privateEmployer ?? "null"}
    })
    WITH j
    OPTIONAL MATCH (c:Company {id: "${companyId}"})
      FOREACH (_ IN CASE WHEN c IS NOT NULL THEN [1] ELSE [] END |
    CREATE (j)-[:POSTED_BY]->(c)
    )
    WITH j`;

  // Append relationships for arrays
  cypher += appendArrayNodes(jd.skills, "Skill", "REQUIRES_SKILL", true);
  cypher += appendArrayNodes(jd.benefits, "Benefit", "OFFERS_BENEFIT", true);
  cypher += appendArrayNodes(
    jd.qualifications,
    "Qualification",
    "REQUIRES_QUALIFICATION",
    true
  );
  cypher += appendArrayNodes(
    jd.preferredSkills,
    "Skill",
    "PREFERS_SKILL",
    true
  );

  cypher += appendArrayNodes(
    jd.responsibilities,
    "Responsibility",
    "HAS_RESPONSIBILITY",
    true
  );
  cypher += appendArrayNodes(
    jd.suitablePastRoles,
    "Role",
    "SUITABLE_FOR_ROLE",
    true
  );
  cypher += appendArrayNodes(
    jd.education,
    "Education",
    "REQUIRED_EDUCATION",
    true
  );
  cypher += appendArrayNodes(
    jd.certifications,
    "Certification",
    "REQUIRED_CERTIFICATION",
    true
  );

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
