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

export type SimplifiedTalentNode = Omit<Awaited<ReturnType<typeof getTalentNodeNoEmbedding>>, "labels" | "_id"> & {
  active_looking?: string;
  active_looking_confirmed_date?: string;
  applicant_id?: string;
  matching_opt_in?: string;
  company?: string;
};

export type SimplifiedNodeWithoutId<T> = Omit<T, "_id" | "labels">;

export interface TalentProfile {
  talent: Omit<SimplifiedTalentNode, "active_looking" | "active_looking_confirmed_date" | "applicant_id" | "matching_opt_in"> | null;
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

    const redactTalentFields = (talentNode: SimplifiedTalentNode): Omit<SimplifiedTalentNode, "active_looking" | "active_looking_confirmed_date" | "applicant_id" | "matching_opt_in"> => {
      const {
        active_looking,
        active_looking_confirmed_date,
        applicant_id,
        matching_opt_in,
        company,
        ...restTalent
      } = talentNode;
      return restTalent;
    };

    return {
      talent: talent ? redactTalentFields((({ labels, _id, ...rest }) => rest as SimplifiedTalentNode)(talent)) : null,
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