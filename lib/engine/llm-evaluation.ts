"use server";

import OpenAI from "openai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getMatchDetails } from "@/lib/engine/get-match-props";
import { inngest } from "@/lib/inngest/client";
import {
  createAlert,
  Alert,
} from "@/lib/match-system/relationship/mutation-sql";
import { v4 as uuidv4 } from "uuid";
import { obfuscateUUID } from "@/lib/global/protect-uuid";


// Zod schema
const jobCandidateMatchSchema = z.object({
  educationMatch: z.boolean(),
  experienceMatch: z.boolean(),
  requiredSkillsMatch: z.boolean(),
  preferredSkillsMatch: z.boolean(),
  certificationsMatch: z.boolean(),
  technicalSkillsStrength: z.boolean(),
  relevantExperienceStrength: z.boolean(),
  leadershipSkillsStrength: z.boolean(),
  technicalFit: z.boolean(),
  careerTrajectoryFit: z.boolean(),
  overallFit: z.boolean(),
  compatibilityScore: z.number().int().min(0).max(10),
  areasForDevelopment: z.array(z.string()),
  recommendation: z.string(),
});

// Convert Zod schema to JSON schema
const jsonSchema = zodToJsonSchema(
  jobCandidateMatchSchema,
  "JobCandidateMatchSchema"
);

// Initialize OpenAI client (using Together.ai in this case)
const togetherai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://api.together.xyz/v1",
});

// System prompt
const systemPrompt = `
Analyze the provided "jobInfo" and "candidateInfo" to determine the compatibility between the job opportunity and the candidate.

Focus on these key areas:
1. Skills match: Compare required/preferred skills in "jobInfo" with the candidate's skills.
2. Experience alignment: Evaluate if the candidate's work history meets or exceeds the job's experience requirements.
3. Education fit: Check if the candidate's educational background satisfies the job's requirements and listed education equivalent.
4. Certification match: Assess if the candidate holds relevant certifications for the position.
5. Career trajectory: Consider how this role aligns with the candidate's past positions and potential career growth.

In your analysis:
- Analysis compatibilities between job requirements and candidate qualifications.
- Identify any significant gaps or misalignments.
- Consider how the candidate's background in related roles might transfer to this position.
- Assess the overall fit, taking into account both technical skills and potential cultural fit based on past work environments.

Provide a concise summary of the candidate's suitability for the role, including:
- An overall compatibility score (1-10).
- Key strengths that make the candidate a good fit.
- Any notable areas where the candidate may need development or may exceed expectations.
- A final recommendation on whether to proceed with the candidate for this position.

Your response should strictly adhere to the provided JSON schema.`;

export async function evaluateJobCandidateMatch(
  jobCandidateData: string,
  matchId: string,
  jobId: string,
  candidateId: string,
  enhancedScore: number
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const userPrompt = `<Context>
  ${jobCandidateData}
  </Context>`;

  const evaluation = await togetherai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    temperature: 0.4,
    max_tokens: 1000,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
    response_format: { type: "json_object", schema: jsonSchema },
  });

  const output = JSON.parse(evaluation.choices[0].message.content!);

  // Update the database with the evaluation results
  const { data, error } = await supabase.from("matching_sys_expanded").upsert(
    {
      job_id: jobId,
      candidate_id: candidateId,
      eval_detail: output,
      match: output.overallFit,
    },
    {
      onConflict: "job_id,candidate_id",
    }
  );

  if (error) {
    console.error("Error updating or inserting evaluation results:", error);
    return {
      message: "Failed to update or insert job-candidate match evaluation.",
      success: false,
    };
  }

  // Retrieve the employer_id
  const { data: jobData, error: jobError } = await supabase
    .from("job_postings")
    .select("employer_id")
    .eq("jd_id", jobId)
    .single();

  if (jobError) {
    console.error("Error fetching employer_id:", jobError);
    return {
      message: "Failed to fetch employer_id for the job.",
      success: false,
    };
  }

  // If match true, record match entry
  if (output.overallFit) {
    const { data: matchData, error: matchError } = await supabase
      .from("matches")
      .upsert(
        {
          id: matchId,
          job_id: jobId,
          candidate_id: candidateId,
          match_score: enhancedScore,
          employer_id: jobData.employer_id,
        },
        {
          onConflict: "job_id,candidate_id",
        }
      );

    if (matchError) {
      console.error("Error recording match:", matchError);
      return {
        message: "Failed to record match in the matches table.",
        success: false,
      };
    }

    const matchDetails = await getMatchDetails(matchId, jobId, candidateId);

    if (matchDetails) {
      // Retrieve the employer's email preferences
      const { data: employerData, error: employerError } = await supabase
        .from("employers")
        .select("email_match")
        .eq("employer_id", jobData.employer_id)
        .single();

      if (employerError) {
        console.error(
          "Error fetching employer email preferences:",
          employerError
        );
        return {
          message: "Failed to fetch employer email preferences.",
          success: false,
        };
      }

      // Check if the employer wants to receive email alerts
      if (employerData.email_match) {
        // Send email match alert to employer
        await inngest.send({
          name: "app/send-email-employer-new-match",
          data: {
            to: matchDetails.to,
            employerName: matchDetails.employerName,
            jobTitle: matchDetails.jobTitle,
            candidateName: matchDetails.candidateName,
            matchReportUrl: matchId,
          },
        });
      }

      // Create alert entry via createAlert
      const alertData: Omit<Alert, "created_at"> = {
        id: uuidv4(),
        user_id: jobData.employer_id,
        type: "match",
        reference_id: matchId,
        status: "unread",
      };

      const createdAlert = await createAlert(alertData);

      if (createdAlert) {
        //console.log("Alert created successfully:", createdAlert);
      } else {
        console.error("Failed to create alert");
      }
    }
  }

  return {
    message: "Success",
    success: true,
  };
}
