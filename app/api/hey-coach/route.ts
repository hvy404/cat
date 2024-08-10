import { createOpenAI } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import intentClassifier from "./intent";
import fetchCranium from "@/app/(auth)/dashboard/views/candidate/resume-copilot/cranium-read";
import llama3Tokenizer from "llama3-tokenizer-js";
import { buildSystemMessage } from "@/app/api/hey-coach/build-system-message";

export const runtime = "edge";

const openai = createOpenAI({
  apiKey: process.env.TOGETHER_API_KEY!,
  baseURL: "https://api.together.xyz/v1",
  compatibility: "compatible",
});

type CacheKeyType = "choice" | "history" | "feedback" | "chat";

// Define the structure of a chat message
interface ChatMessage {
  id: string;
  createdAt: string;
  role: "user" | "assistant";
  content: string;
}

// Define a mapping of intents to cache key types
const intentToCacheKeyTypes: Record<string, CacheKeyType[]> = {
  general: ["choice"],
  history: ["feedback"],
  option: ["choice"],
  advice: ["feedback"],
  compliment: [],
  draft: ["choice"],
  documentation: ["choice"],
};

// Function to fetch data from Cranium based on intent
async function fetchDataBasedOnIntent(
  intent: string,
  sessionId: string,
  userId: string
): Promise<Record<CacheKeyType, any>> {
  const cacheKeyTypes = intentToCacheKeyTypes[intent] || [];
  let results: Record<CacheKeyType, any> = {
    choice: null,
    history: null,
    feedback: null,
    chat: null,
  };

  for (const cacheKeyType of cacheKeyTypes) {
    const result = await fetchCranium(sessionId, userId, cacheKeyType);
    if (result.success) {
      try {
        results[cacheKeyType] = result.data;
      } catch (error) {
        console.error(`Failed to parse ${cacheKeyType} data:`, error);
        results[cacheKeyType] = result.data; // Store as string if parsing fails
      }
    } else {
      console.error(`Failed to fetch ${cacheKeyType} data:`, result.message);
      results[cacheKeyType] = null; // Indicates fetching this data failed
    }
  }

  return results;
}

// Helper function Count tokens
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

// Helper function to generate a unique ID
function generateUniqueId(): string {
  return "uniqueId" + Date.now();
}

export async function POST(req: Request) {
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

  const intent = await intentClassifier(lastMessage);

  const craniumData = await fetchDataBasedOnIntent(
    intent.classification,
    sessionId,
    userId
  );

  // Chat data always retreive for conversational memory
  const chatDataResult = await fetchCranium(sessionId, userId, "chat");

  let chatData: ChatMessage[] = [];
  if (chatDataResult.success && typeof chatDataResult.data === "string") {
    try {
      chatData = JSON.parse(chatDataResult.data) as ChatMessage[];
    } catch (error) {
      console.error("Failed to parse chat data:", error);
    }
  }

  // Function to get the header based on intent
  function getHeaderForIntent(intent: string): string {
    switch (intent) {
      case "history":
        return "\n\nPrevious Feedback:";
      case "option":
      case "draft":
        return "\n\nAvailable Choices:";
      case "advice":
        return "\n\nRelevant Feedback:";
      case "documentation":
      //return "\n\nDocumentation:";
      default:
        return "\n\nAdditional Context:";
    }
  }

  // Append the retrieved context to the last user message
  let enhancedMessage = lastMessage;
  const header = getHeaderForIntent(intent.classification);
  const relevantDataKey = intentToCacheKeyTypes[intent.classification][0];
  const relevantDataString = craniumData[relevantDataKey];

  if (relevantDataString) {
    try {
      const cleanJsonString = JSON.stringify(JSON.parse(relevantDataString));

      enhancedMessage += `${header}\n${cleanJsonString}`;
    } catch (error) {
      console.error("Error parsing relevantData:", error);
      enhancedMessage += `${header}\n${relevantDataString}`;
    }
  }

  const enrichedUserLastMessage: ChatMessage = {
    id: generateUniqueId(),
    createdAt: new Date().toISOString(),
    role: "user",
    content: enhancedMessage,
  };

  // Append new user message to chat history
  chatData.push(enrichedUserLastMessage);

  const messages: CoreMessage[] = chatData.map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));

  // Retreive correct system message based on intent
  const systemMessage = buildSystemMessage(intent.classification);

  console.log("Intent: ", intent);
  console.log("System Message: ", systemMessage);
  console.log("Message Array", messages);

  const result = await streamText({
    system: systemMessage,
    model: openai("mistralai/Mixtral-8x7B-Instruct-v0.1"),
    messages: messages,
  });

  return result.toDataStreamResponse();
}
