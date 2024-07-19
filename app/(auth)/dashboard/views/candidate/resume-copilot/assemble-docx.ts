import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  Packer,
} from "docx";
import { parse, format, isValid } from "date-fns";
import { layouts, LayoutConfig } from "./templates/docx-template";

export interface ResumeItem {
  type: string;
  content: {
    [key: string]: string | undefined;
  };
}

export interface DocxCustomSection {
  type: "custom";
  title: string;
  items: {
    type: string;
    content: {
      text: string;
    };
  }[];
}

export type ResumeData = (ResumeItem | DocxCustomSection)[];

interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  title?: string;
  clearance_level?: string;
}

function formatDate(dateString: string): string {
  if (!dateString) return "";
  const parsedDate = parse(dateString, "yyyy-MM", new Date());
  if (!isValid(parsedDate)) return dateString;
  return format(parsedDate, "MMMM yyyy");
}

export async function generateResume(resumeData: ResumeData, layoutName: keyof typeof layouts = "classic"): Promise<string> {
  try {
    const layout = layouts[layoutName];
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            ...generateHeader(resumeData, layout),
            ...generateIntroduction(resumeData, layout),
            ...generateSections(resumeData, layout),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const base64data = reader.result.split(",")[1];
          resolve(base64data);
        } else {
          reject(new Error("Failed to convert blob to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error in generateResume:", error);
    throw error;
  }
}

const generateHeader = (resumeData: ResumeData, layout: LayoutConfig): Paragraph[] => {
  const personalItems = resumeData.filter(
    (item): item is ResumeItem => item.type === "personal"
  );
  const personalInfo = personalItems.reduce<PersonalInfo>((acc, item) => {
    if (item.content) {
      acc[item.content.key as keyof PersonalInfo] = item.content.value;
    }
    return acc;
  }, {});

  const headerParagraphs: Paragraph[] = [];

  if (personalInfo.name) {
    headerParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({ 
            text: personalInfo.name, 
            ...layout.fontStyles.name,
            size: layout.fontSizes.name
          }),
        ],
        alignment: layout.alignments.header,
      })
    );
  }

  if (personalInfo.title) {
    headerParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({ 
            text: personalInfo.title, 
            ...layout.fontStyles.title,
            size: layout.fontSizes.title
          }),
        ],
        alignment: layout.alignments.header,
      })
    );
  }

  const contactInfo: string[] = [];
  if (personalInfo.email) contactInfo.push(personalInfo.email);
  if (personalInfo.phone) contactInfo.push(personalInfo.phone);
  if (personalInfo.clearance_level)
    contactInfo.push(`Clearance: ${personalInfo.clearance_level}`);
  if (contactInfo.length > 0) {
    headerParagraphs.push(
      new Paragraph({
        children: [new TextRun({ 
          text: contactInfo.join(" | "), 
          size: layout.fontSizes.contactInfo,
          ...layout.fontStyles.contactInfo
        })],
        alignment: layout.alignments.header,
      })
    );
  }

  const addressParts: string[] = [];
  if (personalInfo.city) addressParts.push(personalInfo.city);
  if (personalInfo.state) addressParts.push(personalInfo.state);
  if (personalInfo.zipcode) addressParts.push(personalInfo.zipcode);
  if (addressParts.length > 0) {
    headerParagraphs.push(
      new Paragraph({
        children: [new TextRun({ 
          text: addressParts.join(", "), 
          size: layout.fontSizes.contactInfo,
          ...layout.fontStyles.contactInfo
        })],
        alignment: layout.alignments.header,
      })
    );
  }

  headerParagraphs.push(new Paragraph({ spacing: { after: layout.spacing.afterSection } }));

  return headerParagraphs;
};

const generateIntroduction = (resumeData: ResumeData, layout: LayoutConfig): Paragraph[] => {
  const introItem = resumeData.find(
    (item): item is ResumeItem =>
      item.type === "personal" && item.content.key === "intro"
  );

  if (!introItem) return [];

  return [
    new Paragraph({
      text: "INTRODUCTION",
      heading: layout.headingLevel.sectionHeading,
      thematicBreak: layout.useThematicBreak,
      alignment: layout.alignments.sectionHeading,
      ...layout.fontStyles.sectionHeading,
    }),
    new Paragraph({
      children: [new TextRun({ 
        text: introItem.content.value || "",
        size: layout.fontSizes.normal
      })],
    }),
    new Paragraph({ spacing: { after: layout.spacing.afterSection } }),
  ];
};

const generateSections = (resumeData: ResumeData, layout: LayoutConfig): Paragraph[] => {
  const sections: Paragraph[] = [];

  const sectionOrder = [
    "experience",
    "education",
    "skills",
    "certifications",
    "projects",
    "publications",
    "industryExperiences",
    "potentialRoles",
  ] as const;

  sectionOrder.forEach((sectionType) => {
    const sectionItems = resumeData.filter(
      (item): item is ResumeItem => item.type === sectionType
    );
    if (sectionItems.length > 0) {
      if (sectionType === "skills") {
        sections.push(...generateMergedSkills(sectionItems, layout));
      } else {
        sections.push(...generateSection(sectionType, sectionItems, layout));
      }
    }
  });

  resumeData.forEach((item) => {
    if (item.type === "custom" && "title" in item && "items" in item) {
      sections.push(...generateCustomSection(item, layout));
    }
  });

  return sections;
};

const generateMergedSkills = (skillItems: ResumeItem[], layout: LayoutConfig): Paragraph[] => {
  const allSkills = skillItems
    .map((item) => item.content.value || item.content.name || "")
    .filter(Boolean)
    .join(", ");

  return [
    new Paragraph({
      text: "SKILLS",
      heading: layout.headingLevel.sectionHeading,
      thematicBreak: layout.useThematicBreak,
      alignment: layout.alignments.sectionHeading,
      ...layout.fontStyles.sectionHeading,
    }),
    new Paragraph({
      children: [new TextRun({ 
        text: allSkills,
        size: layout.fontSizes.normal
      })],
    }),
    new Paragraph({ spacing: { after: layout.spacing.afterSection } }),
  ];
};

const generateSection = (title: string, items: ResumeItem[], layout: LayoutConfig): Paragraph[] => {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: title.toUpperCase(),
      heading: layout.headingLevel.sectionHeading,
      thematicBreak: layout.useThematicBreak,
      alignment: layout.alignments.sectionHeading,
      ...layout.fontStyles.sectionHeading,
    }),
  ];

  items.forEach((item) => {
    switch (item.type) {
      case "experience":
        paragraphs.push(...generateExperience(item.content, layout));
        break;
      case "education":
        paragraphs.push(...generateEducation(item.content, layout));
        break;
      case "skills":
        paragraphs.push(...generateSkills(item.content, layout));
        break;
      case "certifications":
        paragraphs.push(...generateCertification(item.content, layout));
        break;
      case "projects":
      case "publications":
      case "industryExperiences":
      case "potentialRoles":
        paragraphs.push(...generateListItem(item.content, layout));
        break;
    }
  });

  paragraphs.push(new Paragraph({ spacing: { after: layout.spacing.afterSection } }));
  return paragraphs;
};

const generateExperience = (content: ResumeItem["content"], layout: LayoutConfig): Paragraph[] => {
  return [
    new Paragraph({
      children: [
        new TextRun({ text: content.job_title || "", bold: true, size: layout.fontSizes.normal }),
        new TextRun({ text: " | ", size: layout.fontSizes.normal }),
        new TextRun({ text: content.organization || "", italics: true, size: layout.fontSizes.normal }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `${formatDate(content.start_date || "")} - ${formatDate(
            content.end_date || ""
          )}`,
          size: layout.fontSizes.normal
        }),
        content.location
          ? new TextRun({ text: ` | ${content.location}`, size: layout.fontSizes.normal })
          : null,
      ].filter((run): run is TextRun => run !== null),
    }),
    ...(content.responsibilities
      ? content.responsibilities.split("\n").map(
          (line: string) =>
            new Paragraph({
              children: [new TextRun({ text: `• ${line.trim()}`, size: layout.fontSizes.normal })],
            })
        )
      : []),
    new Paragraph({}),
  ];
};

const generateEducation = (content: ResumeItem["content"], layout: LayoutConfig): Paragraph[] => {
  return [
    new Paragraph({
      children: [
        new TextRun({ text: content.degree || "", bold: true, size: layout.fontSizes.normal }),
        new TextRun({ text: " | ", size: layout.fontSizes.normal }),
        new TextRun({ text: content.institution || "", italics: true, size: layout.fontSizes.normal }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `${formatDate(content.start_date || "")} - ${formatDate(
            content.end_date || ""
          )}`,
          size: layout.fontSizes.normal
        }),
      ],
    }),
    content.honors_awards_coursework
      ? new Paragraph({
          children: [
            new TextRun({ text: "Honors/Awards/Coursework: ", size: layout.fontSizes.normal }),
            new TextRun({
              text: content.honors_awards_coursework,
              italics: true,
              size: layout.fontSizes.normal
            }),
          ],
        })
      : null,
    new Paragraph({}),
  ].filter((p): p is Paragraph => p !== null);
};

const generateSkills = (content: ResumeItem["content"], layout: LayoutConfig): Paragraph[] => {
  return [
    new Paragraph({
      children: [new TextRun({ text: content.value || content.name || "", size: layout.fontSizes.normal })],
    }),
    new Paragraph({}),
  ];
};

const generateCertification = (content: ResumeItem["content"], layout: LayoutConfig): Paragraph[] => {
  return [
    new Paragraph({
      children: [new TextRun({ text: content.name || "", bold: true, size: layout.fontSizes.normal })],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Issued by: ${content.issuing_organization || "N/A"}`,
          size: layout.fontSizes.normal
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Date Obtained: ${formatDate(content.date_obtained || "")}`,
          size: layout.fontSizes.normal
        }),
      ],
    }),
    content.expiration_date
      ? new Paragraph({
          children: [
            new TextRun({
              text: `Expiration Date: ${formatDate(content.expiration_date)}`,
              size: layout.fontSizes.normal
            }),
          ],
        })
      : null,
    content.credential_id
      ? new Paragraph({
          children: [
            new TextRun({ text: `Credential ID: ${content.credential_id}`, size: layout.fontSizes.normal }),
          ],
        })
      : null,
    new Paragraph({}),
  ].filter((p): p is Paragraph => p !== null);
};

const generateListItem = (content: ResumeItem["content"], layout: LayoutConfig): Paragraph[] => {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: `• ${content.title || content.name || ""}`,
          bold: true,
          size: layout.fontSizes.normal
        }),
      ],
    }),
    content.description
      ? new Paragraph({
          children: [new TextRun({ text: content.description, size: layout.fontSizes.normal })],
        })
      : null,
    new Paragraph({}),
  ].filter((p): p is Paragraph => p !== null);
};

const generateCustomSection = (section: DocxCustomSection, layout: LayoutConfig): Paragraph[] => {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: section.title.toUpperCase(),
      heading: layout.headingLevel.sectionHeading,
      thematicBreak: layout.useThematicBreak,
      alignment: layout.alignments.sectionHeading,
      ...layout.fontStyles.sectionHeading,
    }),
  ];

  section.items.forEach((item) => {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: `• ${item.content.text || ""}`, size: layout.fontSizes.normal })],
      })
    );
  });

  paragraphs.push(new Paragraph({ spacing: { after: layout.spacing.afterSection } }));
  return paragraphs;
};