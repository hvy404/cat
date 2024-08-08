import { ResumeData, ResumeItem, DocxCustomSection } from "./assemble-docx";
import { generateResume } from "./assemble-docx";
import { base64ToBlob } from "./convert-to-file";
import { toast } from "sonner";

export const handleSelectTemplate = async (
  template: string,
  items: any,
  editedItems: any,
  customSections: any,
  setIsTemplateDialogOpen: (value: boolean) => void
) => {
  setIsTemplateDialogOpen(false);
  try {
    const resumeData: ResumeData = prepareResumeData(
      items,
      editedItems,
      customSections
    );

    const base64Data = await generateResume(
      resumeData,
      template as "classic" | "modern" | "minimal"
    );

    if (!base64Data) {
      throw new Error("Failed to generate resume: base64Data is empty");
    }

    const blob = base64ToBlob(
      base64Data,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `resume_${template}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating resume:", error);
    toast.error("Failed to generate resume", {
      description:
        "An error occurred while creating your resume. Please try again.",
      duration: 5000,
    });
  }
};

export const prepareResumeData = (
  items: any,
  editedItems: any,
  customSections: any
): ResumeData => {
  const resumeData: ResumeData = items.chosen.map((item: any): ResumeItem => {
    const editedItem = editedItems[item.id] || item;
    return {
      type: editedItem.type,
      content: editedItem.content,
    };
  });

  customSections.forEach((section: any) => {
    resumeData.push({
      type: "custom",
      title: section.title,
      items: section.items.map((item: any) => ({
        type: "custom",
        content: { text: item.content.text },
      })),
    } as DocxCustomSection);
  });

  return resumeData;
};
