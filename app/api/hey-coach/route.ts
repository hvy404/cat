import { createOpenAI } from "@ai-sdk/openai";
import { CoreMessage, streamText } from 'ai';

export const runtime = "edge";

const openai = createOpenAI({
  apiKey: process.env.TOGETHER_API_KEY!,
  baseURL: "https://api.together.xyz/v1",
  compatibility: "compatible", // strict mode, enable when using the OpenAI API
});

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  console.log("Received messages:", messages);

  const result = await streamText({
    model: openai("mistralai/Mixtral-8x7B-Instruct-v0.1"),
    messages,
  });

  return result.toDataStreamResponse();
}