/**
 * Generates a Cypher query to create a Talent node in the graph database.
 * @param data - The data object containing the candidate information.
 * @param userId - The ID of the user creating the candidate.
 * @returns The Cypher query string.
 */

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

export type Project = {
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  url?: string;
  technologies_used: string[];
  role: string;
  achievements: string[];
};

export type Publication = {
  title: string;
  authors: string[];
  publication_date: string;
  journal_or_conference: string;
  doi?: string;
  url?: string;
  abstract?: string;
  citations?: number;
};

export type Data = {
  name: string;
  email: string;
  phone: string;
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
  projects?: Project[];
  publications?: Publication[];
};

// Helper function to format the embedding array
function formatArrayForCypher(array: number[]) {
  return `[${array.join(", ")}]`; // Adds a space after each comma
}

function escapeString(str: string | undefined): string {
  if (str === undefined) return "";
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function processWorkExperience(work: WorkExperience): WorkExperience {
  return {
    job_title: escapeString(work.job_title),
    organization: escapeString(work.organization),
    start_date: escapeString(work.start_date),
    end_date: escapeString(work.end_date),
    responsibilities: escapeString(work.responsibilities),
  };
}

export function generateCandidateCypherQuery(data: Data, userId: string) {
  let cypher = `
  CREATE (t:Talent {
    name: "${escapeString(data.name || "")}",
    phone: "${escapeString(data.phone || "")}",
    email: "${escapeString(data.email || "")}",
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
    )}"
  })
  WITH t
  `;

  // Education
  if (data.education && data.education.length > 0) {
    data.education.forEach((edu, index) => {
      cypher += `
      CREATE (e${index}:Education {
        degree: "${escapeString(edu.degree || "")}",
        institution: "${escapeString(edu.institution || "")}",
        start_date: "${escapeString(edu.start_date || "")}",
        end_date: "${escapeString(edu.end_date || "")}",
        honors_awards_coursework: "${escapeString(
          edu.honors_awards_coursework || ""
        )}"
      })
      CREATE (t)-[:STUDIED_AT]->(e${index})
      WITH t
      `;
    });
  }

  // Work Experience
  if (data.work_experience && data.work_experience.length > 0) {
    data.work_experience.forEach((work, index) => {
      const processedWork = processWorkExperience(work);
      cypher += `
      CREATE (w${index}:WorkExperience {
        job_title: "${processedWork.job_title}",
        organization: "${processedWork.organization}",
        start_date: "${processedWork.start_date}",
        end_date: "${processedWork.end_date}",
        responsibilities: "${processedWork.responsibilities}"
      })
      CREATE (t)-[:WORKED_AT]->(w${index})
      WITH t
      `;
    });
  }

  // Technical Skills
  if (data.technical_skills && data.technical_skills.length > 0) {
    data.technical_skills.forEach((skill, index) => {
      cypher += `
      MERGE (s${index}:Skill {name: "${escapeString(skill)}"})
      CREATE (t)-[:HAS_SKILL]->(s${index})
      WITH t
      `;
    });
  }

  // Professional Certifications
  if (
    data.professional_certifications &&
    data.professional_certifications.length > 0
  ) {
    data.professional_certifications.forEach((certName, index) => {
      cypher += `
    CREATE (c${index}:Certification {
      name: "${escapeString(certName)}",
      issuing_organization: "",
      date_obtained: "",
      expiration_date: "",
      credential_id: "",
      credential_url: ""
    })
    CREATE (t)-[:HAS_CERTIFICATION]->(c${index})
    WITH t
    `;
    });
  }
  // Industry Experience
  if (data.industry_experience && data.industry_experience.length > 0) {
    data.industry_experience.forEach((industry, index) => {
      cypher += `
      MERGE (i${index}:Industry {name: "${escapeString(industry)}"})
      CREATE (t)-[:HAS_INDUSTRY_EXPERIENCE]->(i${index})
      WITH t
      `;
    });
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    data.projects.forEach((project, index) => {
      cypher += `
      CREATE (p${index}:Project {
        title: "${escapeString(project.title)}",
        description: "${escapeString(project.description)}",
        start_date: "${escapeString(project.start_date)}",
        end_date: "${escapeString(project.end_date || "")}",
        url: "${escapeString(project.url || "")}",
        role: "${escapeString(project.role)}",
        technologies_used: ${JSON.stringify(
          project.technologies_used.map(escapeString)
        )},
        achievements: ${JSON.stringify(project.achievements.map(escapeString))}
      })
      CREATE (t)-[:WORKED_ON]->(p${index})
      WITH t
      `;
    });
  }

  // Publications
  if (data.publications && data.publications.length > 0) {
    data.publications.forEach((pub, index) => {
      cypher += `
      CREATE (pub${index}:Publication {
        title: "${escapeString(pub.title)}",
        authors: ${JSON.stringify(pub.authors.map(escapeString))},
        publication_date: "${escapeString(pub.publication_date)}",
        journal_or_conference: "${escapeString(pub.journal_or_conference)}",
        doi: "${escapeString(pub.doi || "")}",
        url: "${escapeString(pub.url || "")}",
        abstract: "${escapeString(pub.abstract || "")}",
        citations: ${pub.citations || 0}
      })
      CREATE (t)-[:AUTHORED]->(pub${index})
      WITH t
      `;
    });
  }

  cypher += `RETURN t;`;

  return cypher;
}
