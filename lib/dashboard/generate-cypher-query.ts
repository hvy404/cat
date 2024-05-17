export type JobDescription = {
  jobTitle: string;
  company: string;
  client: string;
  skills: string[];
  jobType: string;
  benefits: string[];
  locationType?: string;
  location: { city?: string; state?: string; zipcode?: string }[];
  experience: string;
  description: string;
  salaryRange: {
    maximumSalary: number;
    startingSalary: number;
  };
  qualifications: string[];
  companyOverview: string;
  preferredSkills: string[];
  responsibilities: string[];
  securityClearance: string;
  applicationDeadline: string;
  technicalDemand: string;
  clientInteraction: boolean;
  embedding?: number[];
  remoteFlexibility: boolean;
  suitablePastRoles: string[];
  advancementPotential: boolean;
  leadershipOpportunity: boolean;
};

// Helper function to format the embedding array
function formatArrayForCypher(array: number[]) {
  return `[${array.join(", ")}]`; // Adds a space after each comma
}

// Helper function to escape double quotes in strings
function escapeString(str: string) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function generateJobCypherQuery(
  jd: JobDescription,
  jobDescriptionId: string,
  employerId: string
) {
  let cypher = `
    CREATE (j:Job {
      job_title: "${escapeString(jd.jobTitle)}",  
      job_id: "${jobDescriptionId}",  
      employer_id: "${employerId}",
      embedding: ${jd.embedding ? formatArrayForCypher(jd.embedding) : "[]"},
      client: "${escapeString(jd.client || "")}",  
      company: "${escapeString(jd.company)}",      
      job_type: "${escapeString(jd.jobType)}",   
      location_type: "${escapeString(
        jd.locationType || "unspecified"
      )}", // Added locationType handling   
      location: "${escapeString(JSON.stringify(jd.location))}",    
      experience: "${escapeString(jd.experience || "")}", 
      description: "${escapeString(jd.description)}",      
      maximum_salary: ${jd.salaryRange?.maximumSalary || "null"}, 
      starting_salary: ${jd.salaryRange?.startingSalary || "null"}, 
      company_overview: "${escapeString(jd.companyOverview || "")}", 
      security_clearance: "${escapeString(jd.securityClearance || "none")}", 
      application_deadline: "${escapeString(jd.applicationDeadline || "")}", 
      technical_demand: "${escapeString(jd.technicalDemand || "")}", 
      client_interaction: ${
        jd.clientInteraction !== undefined ? jd.clientInteraction : "null"
      }, 
      remote_flexibility: ${
        jd.remoteFlexibility !== undefined ? jd.remoteFlexibility : "null"
      }, 
      advancement_potential: ${
        jd.advancementPotential !== undefined ? jd.advancementPotential : "null"
      }, 
      leadership_opportunity: ${
        jd.leadershipOpportunity !== undefined
          ? jd.leadershipOpportunity
          : "null"
      } 
    })
    WITH j`;

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
