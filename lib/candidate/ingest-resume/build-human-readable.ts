interface Education {
  degree: string;
  end_date: string;
  start_date: string;
  institution: string;
}

interface WorkExperience {
  end_date: string;
  job_title: string;
  start_date: string;
  organization: string;
  responsibilities: string;
}

interface ProfessionalCertification {
  name: string;
  issuing_organization?: string;
  date_obtained?: string;
  expiration_date?: string;
  credential_id?: string;
}

export interface ResumeData {
  education?: Education[];
  clearance_level?: string;
  work_experience?: WorkExperience[];
  technical_skills?: string[];
  industry_experience?: string[];
  professional_certifications?: ProfessionalCertification[];
  soft_skills?: string[];
  potential_roles?: string[];
}

export function convertResumeToText(resumeData: ResumeData): string {
  let result = "";

  result += "Candidate Resume:\n\n";

  // Education
  if (resumeData.education && resumeData.education.length > 0) {
    result += "Education:\n";
    resumeData.education.forEach((edu) => {
      result += `- ${edu.degree || "Degree"} from ${
        edu.institution || "Institution"
      }`;
      if (edu.start_date) result += `, ${edu.start_date}`;
      if (edu.end_date) result += ` to ${edu.end_date}`;
      result += "\n";
    });
    result += "\n";
  }

  // Work Experience
  if (resumeData.work_experience && resumeData.work_experience.length > 0) {
    result += "Work Experience:\n";
    resumeData.work_experience.forEach((exp) => {
      result += `- ${exp.job_title || "Position"} at ${
        exp.organization || "Organization"
      }`;
      if (exp.start_date) result += `, ${exp.start_date}`;
      if (exp.end_date) result += ` to ${exp.end_date}`;
      result += "\n";
      if (exp.responsibilities)
        result += `  Responsibilities: ${exp.responsibilities}\n`;
      result += "\n";
    });
  }

  // Technical Skills
  if (resumeData.technical_skills && resumeData.technical_skills.length > 0) {
    result += "Technical Skills: ";
    result += resumeData.technical_skills.join(", ") + "\n\n";
  }

  // Industry Experience
  if (
    resumeData.industry_experience &&
    resumeData.industry_experience.length > 0
  ) {
    result += "Industry Experience: ";
    result += resumeData.industry_experience.join(", ") + "\n\n";
  }

  // Professional Certifications
  if (
    resumeData.professional_certifications &&
    resumeData.professional_certifications.length > 0
  ) {
    result += "Professional Certifications:\n";
    resumeData.professional_certifications.forEach((cert) => {
      result += `- ${cert.name} (Obtained: ${cert.date_obtained}, Issued by: ${cert.issuing_organization})\n`;
    });
    result += "\n";
  }

  // Soft Skills
  if (resumeData.soft_skills && resumeData.soft_skills.length > 0) {
    result += "Soft Skills: ";
    result += resumeData.soft_skills.join(", ") + "\n\n";
  }

  // Potential Roles
  if (resumeData.potential_roles && resumeData.potential_roles.length > 0) {
    result += "The candidate is suitable for the following roles: ";
    result += resumeData.potential_roles.join(", ") + "\n\n";
  }

  // Clearance Level
  if (resumeData.clearance_level && resumeData.clearance_level !== "none") {
    result += `Clearance Level: ${resumeData.clearance_level}\n`;
  }

  return result.trim();
}
