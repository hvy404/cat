"use server";
import OpenAI from "openai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";

export default async function intentClassifier(message: string) {
  const togetherAi = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const intentSchema = z.object({
    classification: z.enum([
      "general",
      "history",
      "option",
      "advice",
      "compliment",
      "draft",
    ]),
  });

  const jsonSchema = zodToJsonSchema(intentSchema, "intentSchema");

  const sysPrompt = `You are an AI that classifies the intent of user messages in the context of a conversational AI resume coach. Analyze the message and determine its primary intent based on the following categories:

Intent Definitions:
- General: A general comment or question not related to a specific resume topic.
- History: A question or comment that requires knowledge of the user's past interactions or edits in the resume builder tool.
- Option: Asking for recommendations, options to consider, or suggestions that require knowing the available choices in the resume builder.
- Advice: Seeking guidance or recommendations on a specific aspect of resume writing or job search.
- Compliment: Expressing appreciation, praise, or positive feedback.
- Draft: A question or comment specifically about the current state of the resume draft.

Provide your classification along with a confidence score (0-1) and a brief reasoning for your decision.

Examples:

1. Message: "What else should I add to my resume?"
   Response: {
     "classification": "option",
   }

2. Message: "Can you remind me what sections I've already completed?"
   Response: {
     "classification": "history",
   }

3. Message: "How does my current summary look?"
   Response: {
     "classification": "draft",
   }

4. Message: "What's a good way to highlight my leadership skills?"
   Response: {
     "classification": "advice",
   }

5. Message: "Thanks, that's really helpful!"
   Response: {
     "classification": "compliment",
   }

Your response must be a JSON object with the following structure:
{
  "classification": string (one of the intent categories),
}`;

  const userPrompt = `Classify the intent of the following message: 
  ${message}`;

  const response = await togetherAi.chat.completions.create({
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    // @ts-ignore
    response_format: { type: "json_object", schema: jsonSchema },
    messages: [
      {
        role: "system",
        content: sysPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 2500,
  });

  if (response?.choices?.[0]?.message?.content) {
    const output = JSON.parse(response?.choices?.[0]?.message?.content);
    return output;
  }

  return;
}
