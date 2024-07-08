"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { generateHumanReadableJobDescription } from "./generate-jd-embeddings-human-text";
import { read, write } from "@/lib/neo4j/utils";

interface SalaryRange {
  startingSalary?: number;
  maximumSalary?: number;
}

export interface JobDescription {
  [key: string]: any; // Adding index signature to handle dynamic property access
  leadershipOpportunity?: boolean;
  advancementPotential?: boolean;
  remoteFlexibility?: boolean;
  technicalDemand?: string;
  suitablePastRoles?: string[];
  jobTitle: string;
  company: string;
  location: { city: string; state: string; zipcode: string }[];
  jobType: string;
  description: string;
  companyOverview: string;
  salaryRange?: SalaryRange;
  benefits?: string[];
  clearanceLevel?: string;
  responsibilities?: string[];
  qualifications?: string[];
  skills?: string[];
  experience?: string;
  preferredSkills?: string[];
  summary?: string;
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
    .select(
      "static, inferred, salary_disclose, compensation_type, hourly_comp_min, hourly_comp_max, private_employer, title, location_type, min_salary, max_salary, security_clearance, commission_pay, commission_percent, ote_salary, location"
    )
    .eq("jd_id", jd_id); // TODO: change this to dynamic jd_id

  if (error) {
    return {
      message: "Error fetching resume data.",
      error: error,
    };
  }

  // Static and inferred data is AI generated data from the JD ingestion process
  // We need to merge this data with the user edited data to get the final job description data
  const staticData = data[0].static;
  const inferredData = data[0].inferred;
  const jobDescriptionData = { ...staticData, ...inferredData };

  // Update jobDescriptionData with newer data that user may have edited (from the user confirmatio form)
  jobDescriptionData.salaryDisclose = data[0].salary_disclose;
  jobDescriptionData.compensationType = data[0].compensation_type;
  jobDescriptionData.hourlyCompMin = data[0].hourly_comp_min;
  jobDescriptionData.hourlyCompMax = data[0].hourly_comp_max;
  jobDescriptionData.privateEmployer = data[0].private_employer;
  jobDescriptionData.jobTitle = data[0].title;
  jobDescriptionData.locationType = data[0].location_type;
  jobDescriptionData.minSalary = data[0].min_salary;
  jobDescriptionData.maxSalary = data[0].max_salary;
  jobDescriptionData.clearanceLevel = data[0].security_clearance;
  jobDescriptionData.commissionPay = data[0].commission_pay;
  jobDescriptionData.commissionPercent = data[0].commission_percent;
  jobDescriptionData.oteSalary = data[0].ote_salary;
  jobDescriptionData.location = data[0].location
    ? data[0].location.map(
        (loc: { city: string; state: string; zipcode: string }) => ({
          city: loc.city,
          state: loc.state,
          zipcode: loc.zipcode,
        })
      )
    : null;

  if (jobDescriptionData.compensationType === "hourly") {
    delete jobDescriptionData.minSalary;
    delete jobDescriptionData.maxSalary;
    delete jobDescriptionData.oteSalary;
    delete jobDescriptionData.commissionPercent;
    delete jobDescriptionData.commissionPay;
    delete jobDescriptionData.salaryRange;
  } else if (jobDescriptionData.compensationType === "salary") {
    delete jobDescriptionData.hourlyCompMin;
    delete jobDescriptionData.hourlyCompMax;
    delete jobDescriptionData.oteSalary;
    delete jobDescriptionData.commissionPercent;
    delete jobDescriptionData.commissionPay;
    delete jobDescriptionData.salaryRange;
  } else if (jobDescriptionData.compensationType === "commission") {
    delete jobDescriptionData.minSalary;
    delete jobDescriptionData.maxSalary;
    delete jobDescriptionData.hourlyCompMin;
    delete jobDescriptionData.hourlyCompMax;
    delete jobDescriptionData.salaryRange;
  }

  // Format the job description data
  //const humanReadable = generateHumanReadableJobDescription(jobDescriptionData);

  //console.log("Human", humanReadable);

  console.log("generate-jd-embeddings.ts", jobDescriptionData);

  const jdEmbedd = formatJobDescription(jobDescriptionData);

  /*   const embeddingsResponse = await togetherai.embeddings.create({
    model: "togethercomputer/m2-bert-80M-8k-retrieval",
    input: jdEmbedd,
  });

  // Extract the embeddings from the response
  const embeddings = embeddingsResponse.data[0].embedding; */

  // return the embeddings
  /* return embeddings; */
  return;
}
