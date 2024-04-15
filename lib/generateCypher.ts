export function generateCypher(data) {
/*   const data = {
    name: "Bryan Williams",
    contact: {
      phone: "319-389-1347",
      email: "BRYNATWIL@GMAIL.COM",
      location: "3928 IOWA ST, SAN DIEGO, CA 92104",
    },
    education: [
      {
        degree: "Master of Financial Engineering",
        institution: "UCLA Anderson School of Management",
        start_date: "Nov 2014",
        end_date: "Dec 2015",
      },
      {
        degree: "Masters of Science in Inorganic Chemistry",
        institution: "UCLA Department of Chemistry and Biochemistry",
        start_date: "Sep 2008",
        end_date: "Jun 2012",
      },
      {
        degree: "Bachelor of Arts in Chemistry",
        institution: "Grinnell College",
        start_date: "Aug 2004",
        end_date: "May 2008",
      },
    ],
    work_experience: [
      {
        job_title: "VP, Data Science",
        organization: "TONIK+",
        start_date: "Jul 2019",
        end_date: "Present",
        responsibilties:
          "Created, built, and refined the machine learning and analysis aspects of TONIK+ Video Intelligence, a video analysis tool that identifies the most-resonant portions of content based on retention data. Identification and consolidation of top-performing scenes outperform a similar-length content spot 20-50% on average for KPIs across the entire conversion funnel on Facebook, Instagram, YouTube, Twitter, and more. Partnered with Apple, Netflix, Amazon, and more in helping them achieve growth in their advertising performance targets. Developed Data Science program at TONIK+, allowing the company to research and interpret performance and results across a broad scope of machine learning and quantitative implementations. Managed Edisen’s Data Science team (3x growth since acquisition), focusing primarily on developing skillsets of team members in an effort to make them more than ready for their next role, be it at Edisen or elsewhere. Worked cross-discipline with Edisen’s product team to fully integrate TVI into the company platform as well as develop a fully automated and integrated internal reporting suite.",
      },
    ],
    technical_skills: [
      "Excel",
      "R (Python/SQL/Selenium usage via R libraries)",
    ],
    professional_certifications: ["IBM Applied AI Professional Certificate"],
    soft_skills: [
      "Leadership",
      "Team Management",
      "Communication",
      "Problem Solving",
      "Collaboration",
    ],
    company: "Cambria Investment Management",
    title: "Marketing Consultant",
    industry_experience: [
      "Oversee and implement digital advertising strategy and execution for Cambria across multiple platforms and campaigns, growing Cambria's digital advertising budget from nothing to $5k/week in spend as well as efficient KPI returns on four media platforms that helped Cambria reach the $1B AUM mark.",
    ],
    security_clearance: [
      "CIO of Cambria is a friend of mine, so I work on this on the side to help him out!",
    ],
    fedcon_experience: [
      "Worked with senior management across multiple departments at Cambria on ad strategy, content creation, and execution on ads across Cambria's multitude of offerings (Website content, Funds, Podcast, etc.).",
    ],
    manager_trait: {
      manager_trait_reason:
        "Bryan Williams is a VP of Data Science at TONIK+ Video Intelligence, where he has created, built, and refined the machine learning and analysis aspects of the company's video analysis tool. He has also developed a Data Science program at TONIK+ and managed Edisen's Data Science team. In addition, he has overseen and implemented digital advertising strategy and execution for Cambria Investment Management and served as a Director of Analytics at HYFN. He has also worked as a Quantitative Finance Lead at Parallel Labs Inc and a Research Analyst Intern at Los Angeles Capital Management and Equity Research.",
      manager_boolean: true,
    },
    applicant_id: "68f1ee13-7178-4b11-aae6-67019c4c9457",
    embedding: null,
    matching_opt_in: null,
    active_looking: null,
    active_looking_confirmed_date: null,
    applied_at: [],
    jds_viewed: [],
    interviewed_by: [],
    resume_matched_to_jd: [],
    resume_requested_by_company: [],
    professional_network: {
      mentors: [],
      references: [],
      colleagues: [],
    },
  }; */

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
    embedding: "${data.embedding || ''}",
    matching_opt_in: "${data.matching_opt_in || ''}",
    active_looking: "${data.active_looking || ''}",
    active_looking_confirmed_date: "${data.active_looking_confirmed_date || ''}"
})
WITH t`;

    // Handle Education
    data.education.forEach((edu, index) => {
        cypher += `
UNWIND [{degree: "${edu.degree}", institution: "${edu.institution}", start_date: "${edu.start_date}", end_date: "${edu.end_date}"}] AS edu
MERGE (e:Education {institution: edu.institution, degree: edu.degree})
ON CREATE SET e.start_date = edu.start_date, e.end_date = edu.end_date
MERGE (t)-[:STUDIED_AT]->(e)
${index < data.education.length - 1 ? 'WITH t' : ''}`;
    });

    if (data.education.length > 0) cypher += 'WITH t';

    // Handle Work Experience
    data.work_experience.forEach((work, index) => {
        cypher += `
UNWIND [{job_title: "${work.job_title}", organization: "${work.organization}", start_date: "${work.start_date}", end_date: "${work.end_date}", responsibilities: "${work.responsibilties.replace(/"/g, '\\"')}"}] AS work
MERGE (w:WorkExperience {organization: work.organization, job_title: work.job_title})
ON CREATE SET w.start_date = work.start_date, w.end_date = work.end_date, w.responsibilities = work.responsibilities
MERGE (t)-[:WORKED_AT]->(w)
${index < data.work_experience.length - 1 ? 'WITH t' : ''}`;
    });

    if (data.work_experience.length > 0) cypher += 'WITH t';

    // Handle Skills
    if (data.technical_skills.length > 0) {
        cypher += `
UNWIND ${JSON.stringify(data.technical_skills)} AS skill
MERGE (s:Skill {name: skill})
MERGE (t)-[:HAS_SKILL]->(s)
WITH t`;
    }

    // Handle Certifications
    if (data.professional_certifications.length > 0) {
        cypher += `
UNWIND ${JSON.stringify(data.professional_certifications)} AS cert
MERGE (c:Certification {name: cert})
MERGE (t)-[:HAS_CERTIFICATION]->(c)
WITH t`;
    }

    // Handle Industry Experience
    if (data.industry_experience.length > 0) {
        cypher += `
UNWIND ${JSON.stringify(data.industry_experience)} AS industry
MERGE (i:Industry {name: industry})
MERGE (t)-[:HAS_INDUSTRY_EXPERIENCE]->(i)
WITH t`;
    }

    // Return the main node (or remove this if not needed)
    cypher += `
RETURN t;`;

    return cypher;
}