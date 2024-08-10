import { createOpenAI } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import intentClassifier from "./intent";
import fetchCranium from "@/app/(auth)/dashboard/views/candidate/resume-copilot/cranium-read";
import llama3Tokenizer from "llama3-tokenizer-js";

export const runtime = "edge";

const openai = createOpenAI({
  apiKey: process.env.TOGETHER_API_KEY!,
  baseURL: "https://api.together.xyz/v1",
  compatibility: "compatible",
});

type CacheKeyType = "choice" | "history" | "feedback" | "chat";

// Define a mapping of intents to cache key types
const intentToCacheKeyTypes: Record<string, CacheKeyType[]> = {
  general: ["chat"],
  history: ["feedback", "chat"],
  option: ["choice", "chat"],
  advice: ["feedback", "chat"],
  compliment: ["chat"],
  draft: ["choice"],
};

// Function to fetch data from Cranium based on intent
async function fetchDataBasedOnIntent(
  intent: string,
  sessionId: string,
  userId: string
) {
  const cacheKeyTypes = intentToCacheKeyTypes[intent];
  let results: Record<string, any> = {};

  console.log(intent, sessionId, userId);

  for (const cacheKeyType of cacheKeyTypes) {
    const result = await fetchCranium(sessionId, userId, cacheKeyType);
    if (result.success) {
      try {
        results[cacheKeyType] = JSON.parse(result.data);
      } catch (error) {
        console.error(`Failed to parse ${cacheKeyType} data:`, error);
        results[cacheKeyType] = result.data; // Store as string if parsing fails
      }
    } else {
      console.error(`Failed to fetch ${cacheKeyType} data:`, result.message);
      results[cacheKeyType] = null; // Indicate that fetching this data failed
    }
  }

  return results;
}

// Count tokens
function tokenizeAndCountMessages(messages: CoreMessage[]): {
  tokenizedMessages: number[][];
  totalTokens: number;
} {
  const tokenizedMessages = messages.map((msg) =>
    llama3Tokenizer.encode(msg.content.toString())
  );
  const totalTokens = tokenizedMessages.reduce(
    (sum, tokens) => sum + tokens.length,
    0
  );
  return { tokenizedMessages, totalTokens };
}

export async function POST(req: Request) {
  //const { messages }: { messages: CoreMessage[] } = await req.json();
  const lastMessage = await req.json();

  const magicRailValue = req.headers.get("Magic-Rail");
  const magicGateValue = req.headers.get("Magic-Gate");
  const sessionId = magicRailValue || "default-session";
  const userId = magicGateValue;

  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Something is really wrong." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  //const lastMessage = messages[messages.length - 1].content.toString();
  const intent = await intentClassifier(lastMessage);

  const craniumData = await fetchDataBasedOnIntent(
    intent.classification,
    sessionId,
    userId
  );

  console.log("message", lastMessage);

  console.log("Fetched data from Cranium:", craniumData);

  //const messageCount = messages.length;
  //const { totalTokens } = tokenizeAndCountMessages(messages);

  const systemMessage = `You are a friendly and helpful AI resume coach at G2X Talent. You assist users while they are building their resumes using our drag and drop builder tool. 
  
  Here's some context based on the user's question:
  ${JSON.stringify(craniumData, null, 2)}`;

  const result = await streamText({
    system: systemMessage,
    model: openai("mistralai/Mixtral-8x7B-Instruct-v0.1"),
    messages: [
      {
        role: "user",
        content: lastMessage,
      },
    ],
  });

  return result.toDataStreamResponse();
}
