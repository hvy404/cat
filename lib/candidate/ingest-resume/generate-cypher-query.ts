/**
 * Generates a Cypher query to create a Talent node in the graph database.
 * @param data - The data object containing the candidate information.
 * @param userId - The ID of the user creating the candidate.
 * @returns The Cypher query string.
 */

export type ContactInfo = {
  phone: string;
  email: string;
};

export type Location = {
  city?: string | null;
  state?: string | null;
  zipcode?: string | null;
};

export type Education = {
  degree: string;
  institution: string;
  start_date: string;
  end_date: string;
  honors_awards_coursework?: string;
};

export type WorkExperience = {
  job_title: string;
  organization: string;
  start_date: string;
  end_date: string;
  responsibilities: string;
};

export type ProfessionalNetwork = {
  mentors: string[];
  references: string[];
  colleagues: string[];
};

export type Data = {
  name: string;
  contact: ContactInfo;
  education: Education[];
  professional_certifications: string[];
  work_experience: WorkExperience[];
  technical_skills: string[];
  industry_experience?: string[];
  company: string;
  location?: Location | null;
  title: string;
  clearance_level?: "none" | "basic" | "elevated" | "high";
  applicant_id: string;
  embedding?: number[];
  matching_opt_in?: string;
  active_looking?: string;
  active_looking_confirmed_date?: string;
  soft_skills: string[];
  potential_roles: string[];
  applied_at: string[];
  jds_viewed: string[];
  interviewed_by: string[];
  resume_matched_to_jd: string[];
  resume_requested_by_company: string[];
  professional_network?: ProfessionalNetwork;
};

// Helper function to format the embedding array
function formatArrayForCypher(array: number[]) {
  return `[${array.join(", ")}]`; // Adds a space after each comma
}

// Helper function to escape double quotes in strings
function escapeString(str: string = ""): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

// TODO: jds_viewed, interviewed_by should be matched to jds by relationship and not used as properties
export function generateCandidateCypherQuery(data: Data, userId: string) {
  let cypher = `
  CREATE (t:Talent {
    name: "${escapeString(data.name || "")}",
    phone: "${escapeString(data.contact.phone || "")}",
    email: "${escapeString(data.contact.email || "")}",
    applicant_id: "${userId}",
    company: "${escapeString(data.company || "")}",
    title: "${escapeString(data.title || "")}",
    clearance_level: "${escapeString(data.clearance_level || "")}",
    city: "${escapeString(data.location?.city || "")}",
    state: "${escapeString(data.location?.state || "")}",
    zipcode: "${escapeString(data.location?.zipcode || "")}",
    embedding: ${data.embedding ? formatArrayForCypher(data.embedding) : "[]"},
    matching_opt_in: "${escapeString(data.matching_opt_in || "")}",
    active_looking: "${escapeString(data.active_looking || "")}",
    active_looking_confirmed_date: "${escapeString(
      data.active_looking_confirmed_date || ""
    )}",
    applied_at: ${
      data.applied_at ? JSON.stringify(data.applied_at.map(escapeString)) : "[]"
    },
    jds_viewed: ${
      data.jds_viewed ? JSON.stringify(data.jds_viewed.map(escapeString)) : "[]"
    },
    interviewed_by: ${
      data.interviewed_by
        ? JSON.stringify(data.interviewed_by.map(escapeString))
        : "[]"
    },
    resume_matched_to_jd: ${
      data.resume_matched_to_jd
        ? JSON.stringify(data.resume_matched_to_jd.map(escapeString))
        : "[]"
    },
    resume_requested_by_company: ${
      data.resume_requested_by_company
        ? JSON.stringify(data.resume_requested_by_company.map(escapeString))
        : "[]"
    }
  })
  WITH t`;

  data.education.forEach((edu: Education, index: number) => {
    cypher += `
UNWIND [{
  degree: "${escapeString(edu.degree || "")}",
  institution: "${escapeString(edu.institution || "")}",
  start_date: "${escapeString(edu.start_date || "")}",
  end_date: "${escapeString(edu.end_date || "")}",
  honors_awards_coursework: "${escapeString(
    edu.honors_awards_coursework || ""
  )}" // New property
}] AS edu
MERGE (e:Education {institution: edu.institution, degree: edu.degree})
ON CREATE SET e.start_date = edu.start_date, e.end_date = edu.end_date, e.honors_awards_coursework = edu.honors_awards_coursework
MERGE (t)-[:STUDIED_AT]->(e)
${index < data.education.length - 1 ? "WITH t" : ""}`;
  });

  if (data.education.length > 0) cypher += "WITH t";

  data.work_experience.forEach((work: WorkExperience, index: number) => {
    let responsibilities = escapeString(work.responsibilities || "");
    cypher += `
UNWIND [{job_title: "${escapeString(
      work.job_title || ""
    )}", organization: "${escapeString(
      work.organization || ""
    )}", start_date: "${escapeString(
      work.start_date || ""
    )}", end_date: "${escapeString(
      work.end_date || ""
    )}", responsibilities: "${responsibilities}"}] AS work
MERGE (w:WorkExperience {organization: work.organization, job_title: work.job_title})
ON CREATE SET w.start_date = work.start_date, w.end_date = work.end_date, w.responsibilities = "${responsibilities}"
MERGE (t)-[:WORKED_AT]->(w)
${index < data.work_experience.length - 1 ? "WITH t" : ""}`;
  });

  if (data.work_experience.length > 0) cypher += "WITH t";

  // Handling arrays for technical skills, certifications, and other array-based properties
  if (data.technical_skills && data.technical_skills.length > 0) {
    cypher += `
UNWIND ${JSON.stringify(data.technical_skills.map(escapeString))} AS skill
MERGE (s:Skill {name: skill})
MERGE (t)-[:HAS_SKILL]->(s)
WITH t`;
  }

  if (
    data.professional_certifications &&
    data.professional_certifications.length > 0
  ) {
    cypher += `
UNWIND ${JSON.stringify(
      data.professional_certifications.map(escapeString)
    )} AS cert
MERGE (c:Certification {name: cert})
MERGE (t)-[:HAS_CERTIFICATION]->(c)
WITH t`;
  }

  if (data.industry_experience && data.industry_experience.length > 0) {
    cypher += `
UNWIND ${JSON.stringify(data.industry_experience.map(escapeString))} AS industry
MERGE (i:Industry {name: industry})
MERGE (t)-[:HAS_INDUSTRY_EXPERIENCE]->(i)
WITH t`;
  }

  if (data.soft_skills && data.soft_skills.length > 0) {
    cypher += `
UNWIND ${JSON.stringify(data.soft_skills.map(escapeString))} AS skill
MERGE (s:SoftSkill {name: skill})
MERGE (t)-[:HAS_SOFT_SKILL]->(s)
WITH t`;
  }

  if (data.potential_roles && data.potential_roles.length > 0) {
    cypher += `
UNWIND ${JSON.stringify(data.potential_roles.map(escapeString))} AS role
MERGE (r:Role {name: role})
MERGE (t)-[:HAS_POTENTIAL_ROLE]->(r)
WITH t`;
  }

  if (data.professional_network) {
    if (
      data.professional_network.mentors &&
      data.professional_network.mentors.length > 0
    ) {
      cypher += `
UNWIND ${JSON.stringify(
        data.professional_network.mentors.map(escapeString)
      )} AS mentor
MERGE (m:Mentor {name: mentor})
MERGE (t)-[:HAS_MENTOR]->(m)
WITH t`;
    }

    if (
      data.professional_network.references &&
      data.professional_network.references.length > 0
    ) {
      cypher += `
UNWIND ${JSON.stringify(
        data.professional_network.references.map(escapeString)
      )} AS reference
MERGE (r:Reference {name: reference})
MERGE (t)-[:HAS_REFERENCE]->(r)
WITH t`;
    }

    if (
      data.professional_network.colleagues &&
      data.professional_network.colleagues.length > 0
    ) {
      cypher += `
UNWIND ${JSON.stringify(
        data.professional_network.colleagues.map(escapeString)
      )} AS colleague
MERGE (c:Colleague {name: colleague})
MERGE (t)-[:HAS_COLLEAGUE]->(c)
WITH t`;
    }
  }

  cypher += `
RETURN t;`;

  return cypher;
}
