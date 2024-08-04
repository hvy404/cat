import { CustomSection, CustomItem } from './types';

export const addCustomSection = (
  customSections: CustomSection[],
  newSectionTitle: string
): CustomSection[] => {
  const newSection: CustomSection = {
    id: `custom-section-${Date.now()}`,
    title: newSectionTitle.trim(),
    items: [],
  };
  return [...customSections, newSection];
};

export const addCustomItem = (
  customSections: CustomSection[],
  sectionId: string
): CustomSection[] => {
  const newItem: CustomItem = {
    id: `custom-item-${Date.now()}`,
    type: 'custom',
    content: { text: '' },
    sectionId,
  };
  return customSections.map((section) =>
    section.id === sectionId
      ? { ...section, items: [...section.items, newItem] }
      : section
  );
};

export const editCustomItem = (
  customSections: CustomSection[],
  sectionId: string,
  itemId: string,
  text: string
): CustomSection[] => {
  return customSections.map((section) =>
    section.id === sectionId
      ? {
          ...section,
          items: section.items.map((item) =>
            item.id === itemId ? { ...item, content: { text } } : item
          ),
        }
      : section
  );
};

export const deleteCustomItem = (
  customSections: CustomSection[],
  sectionId: string,
  itemId: string
): CustomSection[] => {
  return customSections.map((section) =>
    section.id === sectionId
      ? {
          ...section,
          items: section.items.filter((item) => item.id !== itemId),
        }
      : section
  );
};

export const deleteCustomSection = (
  customSections: CustomSection[],
  sectionId: string
): CustomSection[] => {
  return customSections.filter((section) => section.id !== sectionId);
};