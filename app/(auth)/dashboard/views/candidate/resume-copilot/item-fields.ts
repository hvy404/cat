import { ItemType } from './types';

export const getFieldsForItemType = (type: ItemType, key?: string): string[] => {
  switch (type) {
    case "personal":
      return [key || ""];
    case "experience":
      return [
        "job_title",
        "organization",
        "start_date",
        "end_date",
        "responsibilities",
      ];
    case "education":
      return [
        "degree",
        "institution",
        "start_date",
        "end_date",
        "honors_awards_coursework",
      ];
    case "skills":
      return ["value"];
    case "certifications":
      return [
        "name",
        "issuing_organization",
        "date_obtained",
        "expiration_date",
        "credential_id",
        "credential_url"
      ];
    case "projects":
      return ["title", "description"];
    case "publications":
      return ["title", "journal_or_conference", "publication_date"];
    default:
      return [];
  }
};

export const fieldLabels: Record<string, string> = {
  job_title: "Job Title",
  organization: "Organization",
  start_date: "Start Date",
  end_date: "End Date",
  responsibilities: "Responsibilities",
  degree: "Degree",
  institution: "Institution",
  honors_awards_coursework: "Honors, Awards & Coursework",
  name: "Name",
  issuing_organization: "Issuing Organization",
  date_obtained: "Date Obtained",
  expiration_date: "Expiration Date",
  credential_id: "Credential ID",
  credential_url: "Credential URL",
  title: "Title",
  description: "Description",
  journal_or_conference: "Journal/Conference",
  publication_date: "Publication Date",
};