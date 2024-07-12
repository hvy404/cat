export type ItemType = 'personal' | 'experience' | 'education' | 'skills' | 'certifications' | 'projects' | 'publications';

export interface Item {
  id: string;
  type: ItemType;
  content: any;
}