export type ContactInfo = {
  phone: string;
  email: string;
  location: string;
};

export type Education = {
  degree: string;
  institution: string;
  start_date: string;
  end_date: string;
};

export type WorkExperience = {
  job_title: string;
  organization: string;
  start_date: string;
  end_date: string;
  responsibilities: string;
};

export type ManagerTrait = {
  manager_trait_reason: string;
  manager_boolean: boolean;
};

export type Data = {
  name: string;
  contact: ContactInfo;
  education: Education[];
  professional_certifications: string[];
  work_experience: WorkExperience[];
  technical_skills: string[];
  industry_experience: string[];
  company: string;
  title: string;
  security_clearance: string[];
  manager_trait: ManagerTrait;
  applicant_id: string;
  embedding?: string;
  matching_opt_in?: string;
  active_looking?: string;
  active_looking_confirmed_date?: string;
  fedcon_experience: string[]; 
};

export function generateCypher(data: Data) {
  let cypher = `
CREATE (t:Talent {
  name: "${data.name}",
  phone: "${data.contact.phone}",
  email: "${data.contact.email}",
  location: "${data.contact.location}",
  applicant_id: "${data.applicant_id}",
  company: "${data.company}",
  title: "${data.title}",
  security_clearance: "${data.security_clearance}",
  fedcon_experience: "${data.fedcon_experience}",
  manager_trait_reason: "${data.manager_trait.manager_trait_reason}",
  manager_boolean: ${data.manager_trait.manager_boolean},
  embedding: "${data.embedding || ""}",
  matching_opt_in: "${data.matching_opt_in || ""}",
  active_looking: "${data.active_looking || ""}",
  active_looking_confirmed_date: "${data.active_looking_confirmed_date || ""}"
})
WITH t`;

  data.education.forEach((edu: Education, index: number) => {
      cypher += `
UNWIND [{degree: "${edu.degree}", institution: "${edu.institution}", start_date: "${edu.start_date}", end_date: "${edu.end_date}"}] AS edu
MERGE (e:Education {institution: edu.institution, degree: edu.degree})
ON CREATE SET e.start_date = edu.start_date, e.end_date = edu.end_date
MERGE (t)-[:STUDIED_AT]->(e)
${index < data.education.length - 1 ? "WITH t" : ""}`;
  });

  if (data.education.length > 0) cypher += "WITH t";

  data.work_experience.forEach((work: WorkExperience, index: number) => {
    const responsibilities = work.responsibilities ? work.responsibilities.replace(/"/g, '\\"') : "";
    cypher += `
UNWIND [{job_title: "${work.job_title}", organization: "${work.organization}", start_date: "${work.start_date}", end_date: "${work.end_date}", responsibilities: "${responsibilities}"}] AS work
MERGE (w:WorkExperience {organization: work.organization, job_title: work.job_title})
ON CREATE SET w.start_date = work.start_date, w.end_date = work.end_date, w.responsibilities = "${responsibilities}"
MERGE (t)-[:WORKED_AT]->(w)
${index < data.work_experience.length - 1 ? "WITH t" : ""}`;
});

if (data.work_experience.length > 0) cypher += "WITH t";

  if (data.technical_skills.length > 0) {
      cypher += `
UNWIND ${JSON.stringify(data.technical_skills)} AS skill
MERGE (s:Skill {name: skill})
MERGE (t)-[:HAS_SKILL]->(s)
WITH t`;
  }

  if (data.professional_certifications.length > 0) {
      cypher += `
UNWIND ${JSON.stringify(data.professional_certifications)} AS cert
MERGE (c:Certification {name: cert})
MERGE (t)-[:HAS_CERTIFICATION]->(c)
WITH t`;
  }

  if (data.industry_experience.length > 0) {
      cypher += `
UNWIND ${JSON.stringify(data.industry_experience)} AS industry
MERGE (i:Industry {name: industry})
MERGE (t)-[:HAS_INDUSTRY_EXPERIENCE]->(i)
WITH t`;
  }

  cypher += `
RETURN t;`;

  return cypher;
}
