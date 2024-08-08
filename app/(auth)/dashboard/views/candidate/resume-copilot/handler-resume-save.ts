import { toast } from "sonner";
import { generateResume } from "./assemble-docx";
import { base64ToBlob } from "./convert-to-file";
import { uploadResumeAction } from "./resume-upload";
import { addResumeEntryAction } from "./add-resume-entry";
import createId from "@/lib/global/cuid-generate";

export const handleSaveVersion = (setIsSaveVersionDialogOpen: (value: boolean) => void) => {
  setIsSaveVersionDialogOpen(true);
};

export const handleSaveVersionSubmit = async (
  setIsSaveVersionDialogOpen: (value: boolean) => void,
  filename: string,
  userId: string,
  prepareResumeData: () => any
) => {
  setIsSaveVersionDialogOpen(false);
  if (!filename || !userId) {
    toast.error("Missing information", {
      description: "Filename or user ID is missing. Please try again.",
      duration: 5000,
    });
    return;
  }

  try {
    const resumeData = prepareResumeData();
    const base64Data = await generateResume(resumeData, "modern");

    if (!base64Data) {
      throw new Error("Failed to generate resume: base64Data is empty");
    }

    const blob = base64ToBlob(
      base64Data,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    const filenameGen = createId();
    const formData = new FormData();
    formData.append("file", blob, `${filename}.docx`);
    formData.append("userId", userId);
    formData.append("filename", filenameGen);

    const { data: uploadData, error: uploadError } = await uploadResumeAction(formData);

    if (uploadError) {
      throw uploadError;
    }

    if (uploadData) {
      const { error: dbError } = await addResumeEntryAction(userId, uploadData, filename);

      if (dbError) {
        throw dbError;
      }
    }

    toast.success("Resume version saved successfully!", {
      description: `Your resume "${filename}" has been saved.`,
      duration: 5000,
    });
  } catch (error) {
    console.error("Error saving resume version:", error);
    toast.error("Failed to save resume version", {
      description: "An error occurred while saving your resume. Please try again.",
      duration: 5000,
    });
  }
};