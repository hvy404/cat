"use server";

import { createStreamableValue } from "ai/rsc";
import { CoreMessage, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const together = createOpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
});

export async function agentResponseConvo(messages: CoreMessage[]) {
  const result = await streamText({
    model: together.completion("mistralai/Mixtral-8x7B-Instruct-v0.1"),
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}
