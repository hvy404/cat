"use server";

import { initializeRedis } from "@/lib/redis/connect"; // upstash/redis client
import OpenAI from "openai";

export async function applicantDetailCopilot(
  applicationId: string,
  section: string
) {
  const cacheKey = `applicantDetails:${applicationId}`;
  let cachedData: any = null;

  const togetherAi = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  // Initialize Redis client
  const redis = initializeRedis();

  // Check for cached data
  cachedData = await redis.get(cacheKey);

  if (!cachedData) {
    console.log("No cached data found for application:", applicationId);
    return {
      success: false,
      message: "No data available for this application",
    };
  }

  const { candidateInfo, jobInfo, applicationInfo } = cachedData;

  const RESPONSE_FORMAT_INSTRUCTIONS = `
Response Format: Your response must be formatted in Markdown and MUST include the following four sections, each with its own header:

1. **Surface-Level Comparison**
   Provide an initial comparison of the candidate's skills against the job requirements.

2. **Nuanced Analysis**
   Offer a deeper analysis of the candidate's skills, considering potential translations and indirect matches.

3. **Assessment of Suitability**
   Give an overall evaluation of the candidate's fit for the position.

4. **Recommendations**
   Provide clear recommendations on next steps and any additional information needed.

Please ensure that each section is clearly labeled and contains the relevant information as described above. Your analysis should be clear, concise, and comprehensive within this structure. Ignore the "_id" fields in the data below and never include the "_id" in your response.
`;

  let llmSystemPrompt = "";
  let llmUserPrompt = "";
  const jobDescription = jobInfo.description;

  switch (section.toLowerCase()) {
    case "skills":
      llmSystemPrompt = `
      You are an experienced job recruiter tasked with evaluating a candidate's skills for the position of ${jobInfo.title}. Use the candidate and job description details provided below to conduct a comprehensive analysis.

Instructions:
1. Start with a surface-level comparison of the candidate's skills against the required and preferred job skills.
2. Then, perform a more nuanced analysis:
   - Look for skills that, while not an exact match, might indicate relevant experience or knowledge.
   - Consider how the candidate's skill set might translate to the required skills, even if not explicitly listed.
   - Evaluate the overall strength of the candidate's skill set in relation to the job requirements.
   - Pay special attention to the candidate's certifications and how they relate to the job requirements.
3. Provide a balanced assessment of the candidate's suitability based on skills, highlighting both strengths and potential areas for growth.
4. Offer recommendations on whether to proceed with the candidate and any additional information that might be needed to make a final decision.

${RESPONSE_FORMAT_INSTRUCTIONS}`;

      llmUserPrompt = `Candidate's skills: ${JSON.stringify(
        candidateInfo?.relationships?.HAS_SKILL || []
      )}
      Required job skills: ${JSON.stringify(
        jobInfo?.relationships?.REQUIRES_SKILL || []
      )}

      Preferred job skills: ${JSON.stringify(
        jobInfo?.relationships?.PREFERS_SKILL || []
      )}`;

      let messages = [
        {
          role: "system" as const,
          content: llmSystemPrompt,
        },
        {
          role: "user" as const,
          content: llmUserPrompt,
        },
      ];

      break;

    case "experience":
      llmSystemPrompt = `
      You are an experienced job recruiter evaluating a candidate's work experience for the position of ${jobInfo.title}. Use the candidate's work history and job experience requirements provided below to conduct a comprehensive analysis.
      
      Instructions:
      1. Begin with a surface-level comparison of the candidate's work history against the required job experience.
      2. Conduct a more in-depth analysis:
         - Look for roles or responsibilities in the candidate's history that, while not exact matches, might provide relevant experience for a Solutions Architect role.
         - Consider how the candidate's career progression aligns with the needs of this position.
         - Evaluate the candidate's experience with leadership, team management, and business development in relation to the job requirements.
      3. Assess the candidate's overall experience level and how it compares to the job requirement.".
      4. Identify any unique experiences or achievements that might set this candidate apart, particularly in relation to complex systems design and development.
      5. Provide a balanced evaluation of the candidate's suitability based on experience, noting both strengths and potential areas of concern.
      6. Offer recommendations on whether to proceed with the candidate and any specific areas to probe further in an interview.

      ${RESPONSE_FORMAT_INSTRUCTIONS}`;

      llmUserPrompt = `Candidate's work history: ${JSON.stringify(
        candidateInfo?.relationships?.WORKED_AT || []
      )}

      Required job experience: ${jobInfo?.experienceRequired}`;

      break;

    case "education":
      llmSystemPrompt = `
      You are an experienced job recruiter assessing a candidate's educational background for the position of ${jobInfo.title}. Use the candidate's education and job education requirements provided below to conduct a comprehensive analysis.
      
      Instructions:
      1. Start with a direct comparison of the candidate's educational qualifications against the job requirements.
      2. Perform a more nuanced evaluation:
         - Consider the relevance of the candidate's degrees to the job requirements.
         - Assess how the candidate's educational background might complement their work experience in relation to the job requirements.
         - Evaluate if the candidate's education meets the requirements of the job.
      3. Consider how the candidate's education might compensate for any potential gaps in experience, or vice versa.
      4. Provide a balanced assessment of the candidate's educational fit for the role, noting both strengths and any potential shortcomings.
      5. Offer recommendations on whether the candidate's educational background is suitable for the position, and suggest any areas where additional training or education might be beneficial.

      ${RESPONSE_FORMAT_INSTRUCTIONS}`;

      llmUserPrompt = `Candidate's education: ${JSON.stringify(
        candidateInfo?.relationships?.STUDIED_AT || []
      )}

      Required job education: ${JSON.stringify(jobInfo?.education || [])}`;

      break;

    case "certifications":
      llmSystemPrompt = `
      You are an experienced job recruiter reviewing a candidate's certifications for the position of ${jobInfo.title}. Use the candidate's certifications and job certification requirements provided below to conduct a comprehensive analysis.
      
      Instructions:
      1. Begin with a direct comparison of the candidate's certifications against those required for the job.
      2. Conduct a more in-depth analysis:
         - Evaluate the relevance and value of the candidate's certifications to any certifications required for the role (applicable only if specified in job requirements).
         - Consider how these certifications align with the job's preference.
         - Assess how the candidate's certifications might indicate broader knowledge or skills relevant to the role, such as project management and agile methodologies.
      3. Identify any missing required certifications and evaluate their importance to the role.
      4. Consider how the candidate's overall profile (experience, education) might compensate for any missing certifications.
      5. Provide a balanced evaluation of the candidate's certification profile, highlighting strengths and areas for potential development.
      6. Offer recommendations on the candidate's suitability based on certifications, and suggest any additional certifications that might enhance their qualifications for this role.

      ${RESPONSE_FORMAT_INSTRUCTIONS}`;

      llmUserPrompt = `Candidate's certifications: ${JSON.stringify(
        candidateInfo?.relationships?.HAS_CERTIFICATION || []
      )}

      Required job certifications: ${JSON.stringify(
        jobInfo?.relationships?.REQUIRED_CERTIFICATION || []
      )}`;

      break;

    default:
      llmSystemPrompt = `
      You are an experienced job recruiter conducting a comprehensive review of a candidate for the position of ${jobInfo.title}. Use the application information, candidate information, and job information provided below to conduct a thorough analysis.
      
      Instructions:
      1. Start with an overall assessment of the candidate's fit for the Solutions Architect role, considering all available information.
      2. Perform a detailed analysis:
         - Evaluate how the candidate's skills, experience, education, and certifications align with the specific job requirements and preferences.
         - Look for any unique qualities or experiences that might make this candidate stand out.
         - Identify any potential red flags or areas of concern, particularly in relation to technical skills or experience with specific technologies mentioned in the job description.
      3. Consider the candidate's career progression and how this position fits into their overall career path.
      4. Assess any additional information provided in the application that might be relevant (e.g., the candidate's location in relation to the job location).
      5. Provide a balanced, comprehensive evaluation of the candidate's suitability for the role, taking into account both their strong business and leadership background and any potential gaps in technical experience.
      6. Offer recommendations on next steps (e.g., proceed to interview, request additional information, reject application) and provide reasoning for your recommendation.

      ${RESPONSE_FORMAT_INSTRUCTIONS}`;

      llmUserPrompt = `Application Info: ${JSON.stringify(
        applicationInfo,
        null,
        2
      )}

      Candidate Info: ${JSON.stringify(candidateInfo, null, 2)}
      Job Info: ${JSON.stringify(jobInfo, null, 2)}`;

      break;
  }

  const analysis = await togetherAi.chat.completions.create({
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    messages: [
      { role: "system", content: llmSystemPrompt },
      { role: "user", content: llmUserPrompt },
    ],
    temperature: 0.6,
    max_tokens: 2000,
  });

  //console.log("System", llmSystemPrompt);
  //console.log("User", llmUserPrompt);

  // Return a response if needed
  return {
    success: true,
    message: analysis.choices[0].message.content,
  };
}
