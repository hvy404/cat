"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface JobPosting {
  jobTitle?: string;
  whatWeOffer?: string[];
  jobDescription?: string;
  responsibilities?: string[];
  requiredQualifications?: string[];
  preferredQualifications?: string[];
  additionalResponsibilities?: string[];
}

const jobPostingToEditorJson = (jobPosting: JobPosting): any => {
  const content = [];

  if (jobPosting.jobTitle) {
    content.push({
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: jobPosting.jobTitle }]
    });
  }

  if (jobPosting.whatWeOffer && jobPosting.whatWeOffer.length > 0) {
    content.push({
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'What We Offer' }]
    });
    const offerItems = jobPosting.whatWeOffer.map(offer => ({
      type: 'listItem',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: offer }] }]
    }));
    content.push({ type: 'bulletList', content: offerItems });
  }

  if (jobPosting.jobDescription) {
    content.push({
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Job Description' }]
    });
    content.push({
      type: 'paragraph',
      content: [{ type: 'text', text: jobPosting.jobDescription }]
    });
  }

  if (jobPosting.responsibilities && jobPosting.responsibilities.length > 0) {
    content.push({
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Responsibilities' }]
    });
    const responsibilityItems = jobPosting.responsibilities.map(responsibility => ({
      type: 'listItem',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: responsibility }] }]
    }));
    content.push({ type: 'bulletList', content: responsibilityItems });
  }

  if (jobPosting.requiredQualifications && jobPosting.requiredQualifications.length > 0) {
    content.push({
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Required Qualifications' }]
    });
    const qualificationItems = jobPosting.requiredQualifications.map(qualification => ({
      type: 'listItem',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: qualification }] }]
    }));
    content.push({ type: 'bulletList', content: qualificationItems });
  }

  if (jobPosting.preferredQualifications && jobPosting.preferredQualifications.length > 0) {
    content.push({
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Preferred Qualifications' }]
    });
    const prefQualificationItems = jobPosting.preferredQualifications.map(qualification => ({
      type: 'listItem',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: qualification }] }]
    }));
    content.push({ type: 'bulletList', content: prefQualificationItems });
  }

  if (jobPosting.additionalResponsibilities && jobPosting.additionalResponsibilities.length > 0) {
    content.push({
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Additional Responsibilities' }]
    });
    const additionalResponsibilityItems = jobPosting.additionalResponsibilities.map(responsibility => ({
      type: 'listItem',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: responsibility }] }]
    }));
    content.push({ type: 'bulletList', content: additionalResponsibilityItems });
  }

  return { type: 'doc', content };
};


export async function RetreiveGeneratedJD(generatedJobDescriptionId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("sow_jd_builder")
    .select("generated_jd")
    .eq("job_description_id", generatedJobDescriptionId);

  if (error) {
    // stringify the error
    const errorString = JSON.stringify(error);

    console.error("Error fetching generated JD", errorString);
    return null;
  }

  if (!data || data.length === 0 || !data[0].generated_jd) {
    console.error("No generated JD found or data is malformed");
    return null;
  }

  const jobDescriptionData = data[0].generated_jd as JobPosting;
  const editorJson = jobPostingToEditorJson(jobDescriptionData);

  //console.log("RetreiveGeneratedJD function completed", editorJson);

  return editorJson;
}
