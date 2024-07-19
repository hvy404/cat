"use server";
import OpenAI from "openai";

const togetherai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://api.together.xyz/v1",
});

interface Resume {
  name: string;
  title: string;
  company?: string;
  phone?: string;
  email?: string;
  education: {
    institution: string;
    degree: string;
    start_date?: string;
    end_date?: string;
  }[];
  location: {
    city?: string;
    state?: string;
    zipcode?: string;
  };
  technical_skills: string[];
  industry_experience?: string[];
  clearance_level?:
    | "none"
    | "basic"
    | "confidential"
    | "critical"
    | "paramount"
    | "q_clearance"
    | "l_clearance";
  professional_certifications?: {
    name: string;
    issuing_organization?: string;
    date_obtained?: string;
    expiration_date?: string;
    credential_id?: string;
  }[];
  work_experience: {
    organization: string;
    job_title: string;
    responsibilities: string;
    start_date?: string;
    end_date?: string;
  }[];
  soft_skills?: string[];
  potential_roles?: string[];
}

export async function generateResumeIntro(resume: Resume) {
  const systemPrompt = `You are an experienced resume coach. Generate a concise and effective introduction for the provided resume, suitable for use at the top of a resume or in a cover letter.`;

  const userPrompt = `<Resume>
  ${JSON.stringify(resume)}
  </Resume>

  Follow these guidelines to create a compelling summary:
  1. Keep the introduction brief, between 3-4 sentences or 50-100 words maximum.
  2. Tailor the content to the specific job or industry mentioned in the resume or job description.
  3. Start with a clear statement of the candidate's professional identity and career focus.
  4. Highlight 2-3 key skills or areas of expertise that are most relevant to the target role.
  5. If possible, include one specific, notable achievement, but phrase it modestly (e.g., "Contributed to a project that..." rather than "Led a successful initiative...").
  6. Convey a sense of the candidate's personality and work style in a professional context.
  7. Express genuine enthusiasm for the field or type of work, without using clichés.
  8. Use clear, straightforward language. Avoid jargon unless it's industry-specific and necessary.
  9. Include a forward-looking statement about career goals or what the candidate hopes to bring to a new role.
  10. Focus on what the candidate offers rather than what they want (avoid objective-style statements).
  11. Ensure the tone is authentic and sounds like a real person, not a list of accomplishments or buzzwords.
  12. Do not use superlatives or exaggerated claims. Present the candidate's value proposition clearly but modestly.
  13. Aim for a tone that is professional yet personable, showcasing the candidate's value while maintaining authenticity and approachability.
  
  Requirement:
  Your response will be only the introduction. DO NOT include any comments or preambles. The introduction should be concise and effective, suitable for use at the top of a resume or in a cover letter. Follow the guidelines provided in the system prompt.`;

  try {
    if (!resume || Object.keys(resume).length === 0) {
      throw new Error("Invalid or empty resume data");
    }

    const extract = await togetherai.chat.completions.create({
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
      model: "meta-llama/Llama-3-70b-chat-hf",
      temperature: 0.6,
      max_tokens: 1000,
    });

    if (
      !extract.choices ||
      extract.choices.length === 0 ||
      !extract.choices[0].message
    ) {
      throw new Error("Invalid response from AI model");
    }

    const generatedIntro = extract.choices[0].message.content;

    if (!generatedIntro || generatedIntro.trim() === "") {
      throw new Error("Generated introduction is empty");
    }

    return {
      message: "Success",
      success: true,
      intro: generatedIntro,
    };
  } catch (error) {
    console.error("Error generating introduction:", error);
    return {
      message: "Failed to generate introduction.",
      success: false,
    };
  }
}
