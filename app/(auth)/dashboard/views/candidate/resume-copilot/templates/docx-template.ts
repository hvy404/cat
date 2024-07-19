import { AlignmentType, HeadingLevel } from "docx";

export interface LayoutConfig {
  fontSizes: {
    name: number;
    title: number;
    contactInfo: number;
    sectionHeading: number;
    normal: number;
  };
  fontStyles: {
    name: { bold: boolean; italics?: boolean };
    title: { bold?: boolean; italics: boolean };
    contactInfo: { bold?: boolean; italics?: boolean };
    sectionHeading: { bold?: boolean; italics?: boolean };
  };
  alignments: {
    header: (typeof AlignmentType)[keyof typeof AlignmentType];
    sectionHeading: (typeof AlignmentType)[keyof typeof AlignmentType];
  };
  spacing: {
    afterSection: number;
  };
  headingLevel: {
    sectionHeading: (typeof HeadingLevel)[keyof typeof HeadingLevel];
  };
  useThematicBreak: boolean;
}

const classicLayout: LayoutConfig = {
  fontSizes: {
    name: 28,
    title: 24,
    contactInfo: 22,
    sectionHeading: 24,
    normal: 22,
  },
  fontStyles: {
    name: { bold: true },
    title: { italics: true }, // Added missing 'italics' property
    contactInfo: {},
    sectionHeading: { bold: true },
  },
  alignments: {
    header: AlignmentType.CENTER,
    sectionHeading: AlignmentType.LEFT,
  },
  spacing: {
    afterSection: 200,
  },
  headingLevel: {
    sectionHeading: HeadingLevel.HEADING_2,
  },
  useThematicBreak: true,
};

const modernLayout: LayoutConfig = {
  fontSizes: {
    name: 30,
    title: 24,
    contactInfo: 20,
    sectionHeading: 24,
    normal: 20,
  },
  fontStyles: {
    name: { bold: true },
    title: { bold: true, italics: false },
    contactInfo: {},
    sectionHeading: { bold: true },
  },
  alignments: {
    header: AlignmentType.LEFT,
    sectionHeading: AlignmentType.LEFT,
  },
  spacing: {
    afterSection: 260,
  },
  headingLevel: {
    sectionHeading: HeadingLevel.HEADING_3,
  },
  useThematicBreak: false,
};

const minimalLayout: LayoutConfig = {
  fontSizes: {
    name: 30,
    title: 24,
    contactInfo: 20,
    sectionHeading: 24,
    normal: 20,
  },
  fontStyles: {
    name: { bold: true },
    title: { italics: false }, // Added missing 'italics' property
    contactInfo: {},
    sectionHeading: { bold: true, italics: true },
  },
  alignments: {
    header: AlignmentType.CENTER,
    sectionHeading: AlignmentType.CENTER,
  },
  spacing: {
    afterSection: 250,
  },
  headingLevel: {
    sectionHeading: HeadingLevel.HEADING_2,
  },
  useThematicBreak: false,
};

const minimalistTimelineLayout: LayoutConfig = {
  fontSizes: {
    name: 34,
    title: 26,
    contactInfo: 20,
    sectionHeading: 28,
    normal: 22,
  },
  fontStyles: {
    name: { bold: true },
    title: { bold: false, italics: true },
    contactInfo: {},
    sectionHeading: { bold: true, italics: false },
  },
  alignments: {
    header: AlignmentType.LEFT,
    sectionHeading: AlignmentType.LEFT,
  },
  spacing: {
    afterSection: 350,
  },
  headingLevel: {
    sectionHeading: HeadingLevel.HEADING_3,
  },
  useThematicBreak: true,
};

export const layouts = {
  classic: classicLayout,
  modern: modernLayout,
  minimal: minimalLayout,
  minimalistTimeline: minimalistTimelineLayout,
};
