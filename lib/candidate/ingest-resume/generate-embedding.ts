import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { convertResumeToText, ResumeData } from "./build-human-readable";

export async function generateCandidateEmbeddings(applicant_id: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const togetherai = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const { data, error } = await supabase
    .from("candidate_create")
    .select("modified_static, inferred")
    .eq("user", applicant_id);

  if (error) {
    return {
      message: "Error fetching resume data.",
      error: error,
    };
  }

  const modified_staticData = data[0].modified_static;
  const inferredData = data[0].inferred;
  const candidateData = { ...modified_staticData, ...inferredData };

  // Remove irrelevant fields
  const { name, company, contact, location, ...relevantData } = candidateData;

  // Ensure all required fields are present
  const resumeData: ResumeData = {
    education: relevantData.education || [],
    clearance_level: relevantData.clearance_level || "none",
    work_experience: relevantData.work_experience || [],
    technical_skills: relevantData.technical_skills || [],
    industry_experience: relevantData.industry_experience || [],
    professional_certifications: relevantData.professional_certifications || [],
    soft_skills: relevantData.soft_skills || [],
    potential_roles: relevantData.potential_roles || [],
  };

  const humanReadableText = convertResumeToText(resumeData);

  console.log(humanReadableText);

  const embeddingsResponse = await togetherai.embeddings.create({
    model: "togethercomputer/m2-bert-80M-8k-retrieval",
    input: humanReadableText,
  });

  // Extract the embeddings from the response
  const embeddings = embeddingsResponse.data[0].embedding;

  // return the embeddings
  return embeddings;
}
