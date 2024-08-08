import { createOpenAI } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import intentClassifier from "./intent";

export const runtime = "edge";

const openai = createOpenAI({
  apiKey: process.env.TOGETHER_API_KEY!,
  baseURL: "https://api.together.xyz/v1",
  compatibility: "compatible", // strict mode, enable when using the OpenAI API
});

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();
  // Read the Magic-Rail value from the header
  const magicRailValue = req.headers.get("Magic-Rail");

  // Classify the intent of each message
  // use the last message in the messages array
  const lastMessage = messages[messages.length - 1].content.toString();
  const intent = await intentClassifier(lastMessage);
  // Log the intent
  console.log("Intent:", intent);

  const result = await streamText({
    system: `You are a friendly and helpful AI resume coach at G2X Talent. You assist users while they are building their resumes using our drag and drop buider tool.`,
    model: openai("mistralai/Mixtral-8x7B-Instruct-v0.1"),
    messages,
  });

  return result.toDataStreamResponse();
}
