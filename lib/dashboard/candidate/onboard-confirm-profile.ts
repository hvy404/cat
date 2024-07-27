"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { validateForm } from "@/app/(auth)/dashboard/views/candidate/helpers/form-validation";

interface FormData {
  name: string;
  phone: string;
  email: string;
  clearance_level: string;
  city: string;
  state: string;
  zipcode: string;
  education: Array<{
    institution: string;
    degree: string;
    start_date?: string;
    end_date?: string;
  }>;
  work_experience: Array<{
    organization: string;
    job_title: string;
    responsibilities: string;
    start_date?: string;
    end_date?: string;
  }>;
  certifications: Array<{
    name: string;
    issuing_organization?: string;
    date_obtained?: string;
    expiration_date?: string;
    credential_id?: string;
  }>;
}

interface OriginalData {
  name?: string;
  title?: string;
  company?: string;
  phone?: string;
  email?: string;
  clearance_level?: string;
  location?: {
    city?: string;
    state?: string;
    zipcode?: string;
  };
  education?: Array<{
    institution: string;
    degree: string;
    start_date?: string;
    end_date?: string;
  }>;
  work_experience?: Array<{
    organization: string;
    job_title: string;
    responsibilities: string;
    start_date?: string;
    end_date?: string;
  }>;
  technical_skills?: string[];
  industry_experience?: string[];
  professional_certifications?: Array<{
    name: string;
    issuing_organization?: string;
    date_obtained?: string;
    expiration_date?: string;
    credential_id?: string;
  }>;
}

// Remap back to the original clearance obfuscated level codes
function remapClearanceLevelToCode(level: string): string {
  switch (level) {
    case "Unclassified":
      return "none";
    case "Public Trust":
      return "basic";
    case "Secret":
      return "confidential";
    case "Top Secret":
      return "critical";
    case "Top Secret/SCI":
      return "paramount";
    case "Q Clearance":
      return "q_clearance";
    case "L Clearance":
      return "l_clearance";
    default:
      return level.toLowerCase().replace(/\s+/g, "_");
  }
}

export async function handleUpload(
  formData: FormData,
  originalData: OriginalData | null,
  user: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { isValid, errors } = await validateForm(formData);
  if (isValid) {
    // Merge form data with original data
    const mergedData = {
      ...originalData,
      name: formData.name,
      title: originalData?.title || "",
      company: originalData?.company || "",
      phone: formData.phone,
      email: formData.email,
      education: formData.education.map((edu) => ({
        institution: edu.institution,
        degree: edu.degree,
        start_date: edu.start_date || "",
        end_date: edu.end_date || "",
      })),
      location: {
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
      },
      work_experience: formData.work_experience.map((exp) => ({
        organization: exp.organization,
        job_title: exp.job_title,
        responsibilities: exp.responsibilities,
        start_date: exp.start_date || "",
        end_date: exp.end_date || "",
      })),
      technical_skills: originalData?.technical_skills || [],
      industry_experience: originalData?.industry_experience || [],
      clearance_level: remapClearanceLevelToCode(formData.clearance_level),
      professional_certifications: formData.certifications.map((cert) => ({
        name: cert.name,
        issuing_organization: cert.issuing_organization || "",
        date_obtained: cert.date_obtained || "",
        expiration_date: cert.expiration_date || "",
        credential_id: cert.credential_id || "",
      })),
    };

    try {
      // First operation: Update modified_static in candidate_create table
      const { data: createData, error: createError } = await supabase
        .from("candidate_create")
        .update({ modified_static: mergedData })
        .eq("user", user);

      if (createError) {
        throw createError;
      }

      // Second operation: Update name in candidates table
      const { data: candidateData, error: candidateError } = await supabase
        .from("candidates")
        .update({ name: formData.name })
        .eq("identity", user);

      if (candidateError) {
        throw candidateError;
      }

      return { success: true, message: "Profile saved successfully!" };
    } catch (error) {
      console.error("Error updating resume data:", error);
      let errorMessage =
        "An error occurred while saving your profile. Please try again later.";

      return {
        success: false,
        message: errorMessage,
      };
    }
  } else {
    const missingFields = Object.keys(errors).map((key) =>
      key.split("_").join(" ")
    );
    const missingFieldsMessage = missingFields.join(", ");
    return {
      success: false,
      message: `Please fill in all required fields: ${missingFieldsMessage}`,
      errors,
    };
  }
}
