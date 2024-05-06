import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { read, write } from "@/lib/neo4j/utils";

export async function generateCandidateEmbeddings(applicant_id: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const togetherai = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const { data, error } = await supabase
    .from("candidate_resume")
    .select("raw")
    .eq("user", applicant_id);

  if (error) {
    return {
      message: "Error fetching resume data.",
      error: error,
    };
  }

  // Extract the resume text from the response
  const resumeText = data[0].raw;

  const embeddingsResponse = await togetherai.embeddings.create({
    model: "togethercomputer/m2-bert-80M-8k-retrieval",
    input: resumeText,
  });

  // Extract the embeddings from the response
  const embeddings = embeddingsResponse.data[0].embedding;

  // return the embeddings
  return embeddings;
}
