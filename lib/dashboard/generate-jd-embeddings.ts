"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { read, write } from "@/lib/neo4j/utils";

interface SalaryRange {
  startingSalary?: number;
  maximumSalary?: number;
}

interface JobDescription {
  [key: string]: any; // Adding index signature to handle dynamic property access
  leadershipOpportunity?: boolean;
  advancementPotential?: boolean;
  clientInteraction?: boolean;
  remoteFlexibility?: boolean;
  technicalDemand?: string;
  suitablePastRoles?: string[];

  jobTitle: string;
  company: string;
  client?: string;
  location: string;
  jobType: string;
  description: string;
  companyOverview: string;
  salaryRange?: SalaryRange;
  benefits?: string[];
  applicationDeadline?: string;
  clearanceLevel?: string;

  responsibilities?: string[];
  qualifications?: string[];
  skills?: string[];
  experience?: string;
  preferredSkills?: string[];
}

function formatJobDescription(json: JobDescription): string {
  let formattedText = "";

  for (const key in json) {
    if (json.hasOwnProperty(key)) {
      formattedText += `${key.charAt(0).toUpperCase() + key.slice(1)}:\n`; // Capitalize key and add a newline

      const value = json[key];
      if (Array.isArray(value)) {
        // Format as list if the value is an array
        formattedText += value.map((item: string) => `  - ${item}`).join("\n");
      } else if (typeof value === "object" && value !== null) {
        // Recursively format if the value is an object (excluding arrays)
        formattedText += formatJobDescription(value as JobDescription).replace(
          /^/gm,
          "  "
        ); // Indent nested objects
      } else if (value === null) {
        // Handle null values by displaying "Not specified"
        formattedText += "Not specified";
      } else {
        // Append other types (e.g., strings, numbers)
        formattedText += value;
      }

      formattedText += "\n\n"; // Add double newline for separation
    }
  }

  return formattedText;
}

export async function generateJobDescriptionEmbeddings(jd_id: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const togetherai = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const { data, error } = await supabase
    .from("job_postings")
    .select("static, inferred")
    .eq("jd_id", jd_id); // TODO: change this to dynamic jd_id

  if (error) {
    return {
      message: "Error fetching resume data.",
      error: error,
    };
  }

  // Extract the resume text from the response
  const staticDetails = data[0].static;
  const inferredDetails = data[0].inferred;

  // Combine the static and inferred details
  const jobDescription = {
    ...staticDetails,
    ...inferredDetails,
  };

  const jdEmbedd = formatJobDescription(jobDescription);

  console.log(jdEmbedd);

  const embeddingsResponse = await togetherai.embeddings.create({
    model: "togethercomputer/m2-bert-80M-8k-retrieval",
    input: jdEmbedd,
  });

  // Extract the embeddings from the response
  const embeddings = embeddingsResponse.data[0].embedding;

  // return the embeddings
  return embeddings;
}
