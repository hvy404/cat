import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';

export interface ResumeItem {
  type: string;
  content: {
    [key: string]: string | undefined;
  };
}

export interface DocxCustomSection {
  type: 'custom';
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

export async function generateResume(resumeData: ResumeData): Promise<string> {
  try {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            ...generateHeader(resumeData),
            ...generateSections(resumeData),
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

const generateHeader = (resumeData: ResumeData): Paragraph[] => {
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

  // Name
  if (personalInfo.name) {
    headerParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: personalInfo.name, bold: true, size: 28 })],
        alignment: AlignmentType.CENTER,
      })
    );
  }

  // Title
  if (personalInfo.title) {
    headerParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: personalInfo.title, italics: true, size: 24 })],
        alignment: AlignmentType.CENTER,
      })
    );
  }

  // Contact Information
  const contactInfo: string[] = [];
  if (personalInfo.email) contactInfo.push(personalInfo.email);
  if (personalInfo.phone) contactInfo.push(personalInfo.phone);
  if (personalInfo.clearance_level) contactInfo.push(`Clearance: ${personalInfo.clearance_level}`);
  if (contactInfo.length > 0) {
    headerParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: contactInfo.join(' | '), size: 22 })],
        alignment: AlignmentType.CENTER,
      })
    );
  }

  // Address
  const addressParts: string[] = [];
  if (personalInfo.city) addressParts.push(personalInfo.city);
  if (personalInfo.state) addressParts.push(personalInfo.state);
  if (personalInfo.zipcode) addressParts.push(personalInfo.zipcode);
  if (addressParts.length > 0) {
    headerParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: addressParts.join(', '), size: 22 })],
        alignment: AlignmentType.CENTER,
      })
    );
  }

  // Add a blank line after the header
  headerParagraphs.push(new Paragraph({}));

  return headerParagraphs;
};

const generateSections = (resumeData: ResumeData): Paragraph[] => {
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
      sections.push(...generateSection(sectionType, sectionItems));
    }
  });

  resumeData.forEach((item) => {
    if (item.type === "custom" && "title" in item && "items" in item) {
      sections.push(...generateCustomSection(item));
    }
  });

  return sections;
};

const generateSection = (title: string, items: ResumeItem[]): Paragraph[] => {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: title.toUpperCase(),
      heading: HeadingLevel.HEADING_2,
      thematicBreak: true,
    }),
  ];

  items.forEach((item) => {
    switch (item.type) {
      case "experience":
        paragraphs.push(...generateExperience(item.content));
        break;
      case "education":
        paragraphs.push(...generateEducation(item.content));
        break;
      case "skills":
        paragraphs.push(...generateSkills(item.content));
        break;
      case "certifications":
        paragraphs.push(...generateCertification(item.content));
        break;
      case "projects":
      case "publications":
      case "industryExperiences":
      case "potentialRoles":
        paragraphs.push(...generateListItem(item.content));
        break;
    }
  });

  paragraphs.push(new Paragraph({}));
  return paragraphs;
};

const generateExperience = (content: ResumeItem['content']): Paragraph[] => {
  return [
    new Paragraph({
      children: [
        new TextRun({ text: content.job_title || "", bold: true }),
        new TextRun({ text: " | " }),
        new TextRun({ text: content.organization || "", italics: true }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${content.start_date || ""} - ${content.end_date || ""}` }),
        content.location ? new TextRun({ text: ` | ${content.location}` }) : null,
      ].filter((run): run is TextRun => run !== null),
    }),
    ...(content.responsibilities
      ? content.responsibilities.split("\n").map(
          (line: string) =>
            new Paragraph({
              children: [new TextRun({ text: `• ${line.trim()}` })],
            })
        )
      : []),
    new Paragraph({}),
  ];
};

const generateEducation = (content: ResumeItem['content']): Paragraph[] => {
  return [
    new Paragraph({
      children: [
        new TextRun({ text: content.degree || "", bold: true }),
        new TextRun({ text: " | " }),
        new TextRun({ text: content.institution || "", italics: true }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${content.start_date || ""} - ${content.end_date || ""}` }),
      ],
    }),
    content.honors_awards_coursework
      ? new Paragraph({
          children: [
            new TextRun({ text: "Honors/Awards/Coursework: " }),
            new TextRun({ text: content.honors_awards_coursework, italics: true }),
          ],
        })
      : null,
    new Paragraph({}),
  ].filter((p): p is Paragraph => p !== null);
};

const generateSkills = (content: ResumeItem['content']): Paragraph[] => {
  return [
    new Paragraph({
      children: [new TextRun({ text: content.value || content.name || "" })],
    }),
    new Paragraph({}),
  ];
};

const generateCertification = (content: ResumeItem['content']): Paragraph[] => {
  return [
    new Paragraph({
      children: [
        new TextRun({ text: content.name || "", bold: true }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Issued by: ${content.issuing_organization || 'N/A'}` }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Date Obtained: ${content.date_obtained || 'N/A'}` }),
      ],
    }),
    content.expiration_date ? new Paragraph({
      children: [
        new TextRun({ text: `Expiration Date: ${content.expiration_date}` }),
      ],
    }) : null,
    content.credential_id ? new Paragraph({
      children: [
        new TextRun({ text: `Credential ID: ${content.credential_id}` }),
      ],
    }) : null,
    content.credential_url ? new Paragraph({
      children: [
        new TextRun({ text: `Credential URL: ${content.credential_url}` }),
      ],
    }) : null,
    new Paragraph({}),
  ].filter((p): p is Paragraph => p !== null);
};

const generateListItem = (content: ResumeItem['content']): Paragraph[] => {
  return [
    new Paragraph({
      children: [new TextRun({ text: `• ${content.title || content.name || ""}`, bold: true })],
    }),
    content.description ? new Paragraph({
      children: [new TextRun({ text: content.description })],
    }) : null,
    new Paragraph({}),
  ].filter((p): p is Paragraph => p !== null);
};

const generateCustomSection = (section: DocxCustomSection): Paragraph[] => {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: section.title.toUpperCase(),
      heading: HeadingLevel.HEADING_2,
      thematicBreak: true,
    }),
  ];

  section.items.forEach((item) => {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: `• ${item.content.text || ""}` })],
      })
    );
  });

  paragraphs.push(new Paragraph({}));
  return paragraphs;
};