import {
  TalentNode,
  WorkExperienceNode,
  EducationNode,
  SkillNode,
  CertificationNode,
  ProjectNode,
  PublicationNode,
  NodeWithId,
  getTalentNodeNoEmbedding,
  getTalentCertifications,
  getTalentEducation,
  getTalentProjects,
  getTalentPublications,
  getTalentSkills,
  getTalentWorkExperiences,
} from "@/lib/candidate/global/mutation"; 

// Interface for the structured suggestion
export interface ResumeSuggestion {
  title: string;
  type: string;
  message: string;
  priority: "high" | "medium" | "low";
}

export function generateResumeSuggestions(
  talentData: TalentNode & NodeWithId,
  workExperiences: (WorkExperienceNode & NodeWithId)[],
  educations: (EducationNode & NodeWithId)[],
  skills: (SkillNode & NodeWithId)[],
  certifications: (CertificationNode & NodeWithId)[],
  projects: (ProjectNode & NodeWithId)[],
  publications: (PublicationNode & NodeWithId)[]
): ResumeSuggestion[] {
  const suggestions: ResumeSuggestion[] = [];

  // Check for work experiences
  if (workExperiences.length === 0) {
    suggestions.push({
      title: "Add Work Experience",
      type: "experience",
      message: "Include your work experiences to showcase your professional background.",
      priority: "high",
    });
  } else if (workExperiences.length < 3) {
    suggestions.push({
      title: "Expand Work Experience",
      type: "experience",
      message: "Consider adding more work experiences to provide a comprehensive view of your career.",
      priority: "medium",
    });
  }

  // Check for education
  if (educations.length === 0) {
    suggestions.push({
      title: "Add Education",
      type: "education",
      message: "Include your educational background to highlight your academic achievements.",
      priority: "high",
    });
  }

  // Check for skills
  if (skills.length < 5) {
    suggestions.push({
      title: "Add More Skills",
      type: "skills",
      message: "List more of your relevant skills to demonstrate your capabilities to potential employers.",
      priority: "medium",
    });
  }

  // Check for certifications
  if (certifications.length === 0) {
    suggestions.push({
      title: "Add Certifications",
      type: "certifications",
      message: "If you have any relevant certifications, add them to boost your credibility.",
      priority: "low",
    });
  } else {
    const incompleteCertifications = certifications.filter(cert => 
      !cert.issuing_organization || !cert.date_obtained || !cert.credential_id
    );
    if (incompleteCertifications.length > 0) {
      suggestions.push({
        title: "Complete Certification Details",
        type: "certifications",
        message: "Some of your certifications are missing important details like issuing organization, date obtained, or credential ID. Complete these to make your certifications more credible.",
        priority: "medium",
      });
    }
  }

  // Check for detailed work experience descriptions
  const shortDescriptions = workExperiences.filter(exp => exp.responsibilities.split(' ').length < 20);
  if (shortDescriptions.length > 0) {
    suggestions.push({
      title: "Elaborate on Work Experiences",
      type: "experience",
      message: "Provide more detailed descriptions for some of your work experiences to better highlight your achievements and responsibilities.",
      priority: "medium",
    });
  }

  return suggestions;
}

export async function FetchResumeEnhancements(candidateId: string): Promise<ResumeSuggestion[]> {
  try {
    const talentData = await getTalentNodeNoEmbedding(candidateId);
    if (!talentData) {
      return [{
        title: "Error Fetching Profile",
        type: "error",
        message: "Unable to fetch your profile data. Please try again later.",
        priority: "high",
      }];
    }

    const workExperiences = await getTalentWorkExperiences(candidateId);
    const educations = await getTalentEducation(candidateId);
    const skills = await getTalentSkills(candidateId);
    const certifications = await getTalentCertifications(candidateId);
    const projects = await getTalentProjects(candidateId);
    const publications = await getTalentPublications(candidateId);

    return generateResumeSuggestions(
      talentData,
      workExperiences,
      educations,
      skills,
      certifications,
      projects,
      publications
    );
  } catch (error) {
    console.error("Error fetching resume enhancements:", error);
    return [{
      title: "Error Occurred",
      type: "error",
      message: "An error occurred while fetching your resume data. Please try again later.",
      priority: "high",
    }];
  }
}