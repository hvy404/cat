import {
    getTalentNodeNoEmbedding,
    getTalentWorkExperiences,
    getTalentEducation,
    getTalentSkills,
    getTalentCertifications,
    getTalentIndustryExperiences,
    getTalentPotentialRoles,
    getTalentProjects,
    getTalentPublications,
    WorkExperienceNode,
    EducationNode,
    SkillNode,
    CertificationNode,
    IndustryNode,
    RoleNode,
    ProjectNode,
    PublicationNode,
    NodeWithId
  } from "@/lib/candidate/global/mutation";
  
  export type SimplifiedTalentNode = Omit<Awaited<ReturnType<typeof getTalentNodeNoEmbedding>>, "labels" | "_id">;
  export type SimplifiedNodeWithoutId<T> = Omit<T, "_id" | "labels">;
  
  export interface TalentProfile {
    talent: SimplifiedTalentNode | null;
    workExperiences: SimplifiedNodeWithoutId<WorkExperienceNode>[];
    education: SimplifiedNodeWithoutId<EducationNode>[];
    skills: SimplifiedNodeWithoutId<SkillNode>[];
    certifications: SimplifiedNodeWithoutId<CertificationNode>[];
    industryExperiences: SimplifiedNodeWithoutId<IndustryNode>[];
    potentialRoles: SimplifiedNodeWithoutId<RoleNode>[];
    projects: SimplifiedNodeWithoutId<ProjectNode>[];
    publications: SimplifiedNodeWithoutId<PublicationNode>[];
  }
  
  export async function getCompleteTalentProfile(talentId: string): Promise<TalentProfile> {
    try {
      const [
        talent,
        workExperiences,
        education,
        skills,
        certifications,
        industryExperiences,
        potentialRoles,
        projects,
        publications
      ] = await Promise.all([
        getTalentNodeNoEmbedding(talentId),
        getTalentWorkExperiences(talentId),
        getTalentEducation(talentId),
        getTalentSkills(talentId),
        getTalentCertifications(talentId),
        getTalentIndustryExperiences(talentId),
        getTalentPotentialRoles(talentId),
        getTalentProjects(talentId),
        getTalentPublications(talentId)
      ]);
  
      const simplifyNode = <T extends NodeWithId>(node: T): SimplifiedNodeWithoutId<T> => {
        const { _id, labels, ...rest } = node;
        return rest;
      };
  
      return {
        talent: talent ? (({ labels, _id, ...rest }) => rest as SimplifiedTalentNode)(talent) : null,
        workExperiences: workExperiences.map(simplifyNode),
        education: education.map(simplifyNode),
        skills: skills.map(simplifyNode),
        certifications: certifications.map(simplifyNode),
        industryExperiences: industryExperiences.map(simplifyNode),
        potentialRoles: potentialRoles.map(simplifyNode),
        projects: projects.map(simplifyNode),
        publications: publications.map(simplifyNode)
      };
    } catch (error) {
      console.error("Error fetching complete talent profile:", error);
      throw error;
    }
  }