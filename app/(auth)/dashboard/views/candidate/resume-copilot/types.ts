import { TalentProfile } from "./get-data";

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

export interface QueueItem {
  itemId: string;
  cardContent: any;
}

// Add new interfaces for custom sections and items
export interface CustomSection {
  id: string;
  title: string;
  items: CustomItem[];
}

export interface CustomItem extends Item {
  id: string;
  type: "custom";
  content: { text: string };
  sectionId: string;
}

export interface HistoryEntry {
  action: "add" | "remove" | "reorder" | "move";
  itemId: string;
  timestamp: number;
}

export interface ResumeBuilderProps {
  talentProfile: TalentProfile;
  onSelectedItemsChange?: (items: Item[]) => void;
  selectedItems?: Item[];
  selectedRole?: string | null;
  userId: string;
}