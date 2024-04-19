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
  soft_skills: string[];
  potential_roles: string[];
  applied_at: string[];
  jds_viewed: string[];
  interviewed_by: string[];
  resume_matched_to_jd: string[];
  resume_requested_by_company: string[];
  professional_network: ProfessionalNetwork;
};

//TODO: jds_viewed, interviewed_by should be matched to jds by relatonship and not used as properties
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
    security_clearance: "${data.security_clearance.join(', ')}",
    fedcon_experience: "${data.fedcon_experience.join(', ')}",
    manager_trait_reason: "${data.manager_trait.manager_trait_reason}",
    manager_boolean: ${data.manager_trait.manager_boolean},
    embedding: "${data.embedding || ''}",
    matching_opt_in: "${data.matching_opt_in || ''}",
    active_looking: "${data.active_looking || ''}",
    active_looking_confirmed_date: "${data.active_looking_confirmed_date || ''}",
    applied_at: "${data.applied_at.join(', ')}",
    jds_viewed: "${data.jds_viewed.join(', ')}",
    interviewed_by: "${data.interviewed_by.join(', ')}",
    resume_matched_to_jd: "${data.resume_matched_to_jd.join(', ')}",
    resume_requested_by_company: "${data.resume_requested_by_company.join(', ')}"
  })
  WITH t`;

  data.education.forEach((edu: Education, index: number) => {
      cypher += `
UNWIND [{degree: "${edu.degree}", institution: "${edu.institution}", start_date: "${edu.start_date}", end_date: "${edu.end_date}"}] AS edu
MERGE (e:Education {institution: edu.institution, degree: edu.degree})
ON CREATE SET e.start_date = edu.start_date, e.end_date = edu.end_date
MERGE (t)-[:STUDIED_AT]->(e)
${index < data.education.length - 1? "WITH t" : ""}`;
  });

  if (data.education.length > 0) cypher += "WITH t";

  data.work_experience.forEach((work: WorkExperience, index: number) => {
    const responsibilities = work.responsibilities? work.responsibilities.replace(/"/g, '\\"') : "";
    cypher += `
UNWIND [{job_title: "${work.job_title}", organization: "${work.organization}", start_date: "${work.start_date}", end_date: "${work.end_date}", responsibilities: "${responsibilities}"}] AS work
MERGE (w:WorkExperience {organization: work.organization, job_title: work.job_title})
ON CREATE SET w.start_date = work.start_date, w.end_date = work.end_date, w.responsibilities = "${responsibilities}"
MERGE (t)-[:WORKED_AT]->(w)
${index < data.work_experience.length - 1? "WITH t" : ""}`;
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

  if (data.soft_skills.length > 0) {
      cypher += `
UNWIND ${JSON.stringify(data.soft_skills)} AS skill
MERGE (s:SoftSkill {name: skill})
MERGE (t)-[:HAS_SOFT_SKILL]->(s)
WITH t`;
  }

  if (data.potential_roles.length > 0) {
      cypher += `
UNWIND ${JSON.stringify(data.potential_roles)} AS role
MERGE (r:Role {name: role})
MERGE (t)-[:HAS_POTENTIAL_ROLE]->(r)
WITH t`;
  }

  if (data.applied_at.length > 0) {
      cypher += `
UNWIND ${JSON.stringify(data.applied_at)} AS applied
MERGE (a:AppliedAt {date: applied})
MERGE (t)-[:APPLIED_AT]->(a)
WITH t`;
  }

  if (data.jds_viewed.length > 0) {
      cypher += `
UNWIND ${JSON.stringify(data.jds_viewed)} AS viewed
MERGE (v:JdsViewed {date: viewed})
MERGE (t)-[:JDS_VIEWED]->(v)
WITH t`;
  }

  if (data.interviewed_by.length > 0) {
      cypher += `
UNWIND ${JSON.stringify(data.interviewed_by)} AS interviewed
MERGE (i:InterviewedBy {name: interviewed})
MERGE (t)-[:INTERVIEWED_BY]->(i)
WITH t`;
  }

  if (data.resume_matched_to_jd.length > 0) {
      cypher += `
UNWIND ${JSON.stringify(data.resume_matched_to_jd)} AS matched
MERGE (m:ResumeMatchedToJd {date: matched})
MERGE (t)-[:RESUME_MATCHED_TO_JD]->(m)
WITH t`;
  }

  if (data.resume_requested_by_company.length > 0) {
      cypher += `
UNWIND ${JSON.stringify(data.resume_requested_by_company)} AS requested
MERGE (r:ResumeRequestedByCompany {date: requested})
MERGE (t)-[:RESUME_REQUESTED_BY_COMPANY]->(r)
WITH t`;
  }

  if (data.professional_network) {
      if (data.professional_network.mentors.length > 0) {
          cypher += `
UNWIND ${JSON.stringify(data.professional_network.mentors)} AS mentor
MERGE (m:Mentor {name: mentor})
MERGE (t)-[:HAS_MENTOR]->(m)
WITH t`;
      }

      if (data.professional_network.references.length > 0) {
          cypher += `
UNWIND ${JSON.stringify(data.professional_network.references)} AS reference
MERGE (r:Reference {name: reference})
MERGE (t)-[:HAS_REFERENCE]->(r)
WITH t`;
      }

      if (data.professional_network.colleagues.length > 0) {
          cypher += `
UNWIND ${JSON.stringify(data.professional_network.colleagues)} AS colleague
MERGE (c:Colleague {name: colleague})
MERGE (t)-[:HAS_COLLEAGUE]->(c)
WITH t`;
      }
  }

  cypher += `
RETURN t;`;

  return cypher;
}
