export type ItemType =
  | "personal"
  | "experience"
  | "education"
  | "skills"
  | "certifications"
  | "projects"
  | "publications"
  | "custom";

export interface Item {
  id: string;
  type: ItemType;
  content: any;
}

export interface CustomItem extends Item {
  id: string;
  type: "custom";
  content: { text: string };
}
