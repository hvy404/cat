import { createOpenAI } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import intentClassifier from "./intent";
import fetchCranium from "@/app/(auth)/dashboard/views/candidate/resume-copilot/cranium-read";
import llama3Tokenizer from "llama3-tokenizer-js";
import { buildSystemMessage } from "@/app/api/hey-coach/build-system-message";
import { ResumeBuilderGuide } from "@/app/(auth)/dashboard/views/candidate/resume-copilot/documentation/docs";

export const runtime = "edge";

const openai = createOpenAI({
  apiKey: process.env.TOGETHER_API_KEY!,
  baseURL: "https://api.together.xyz/v1",
  compatibility: "compatible",
});

type CacheKeyType = "choice" | "feedback" | "chat";

interface ChatMessage {
  id: string;
  createdAt: string;
  role: "user" | "assistant";
  content: string;
}

const intentToCacheKeyTypes: Record<string, CacheKeyType[]> = {
  general: ["chat"],
  option: ["choice"],
  advice: ["feedback", "choice"],
  compliment: [],
  draft: ["choice"],
  documentation: [],
};

async function fetchDataBasedOnIntent(
  intent: string,
  sessionId: string,
  userId: string
): Promise<Record<CacheKeyType, any>> {
  if (intent === "documentation") {
    return { choice: null, feedback: null, chat: null };
  }

  const cacheKeyTypes = intentToCacheKeyTypes[intent] || [];
  let results: Record<CacheKeyType, any> = {
    choice: null,
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
        results[cacheKeyType] = result.data;
      }
    } else {
      console.error(`Failed to fetch ${cacheKeyType} data:`, result.message);
      results[cacheKeyType] = null;
    }
  }

  return results;
}

function generateRelevantContext(intent: string, craniumData: Record<CacheKeyType, any>) {
  if (intent === "documentation") {
    return JSON.stringify(ResumeBuilderGuide);
  }

  const keys = intentToCacheKeyTypes[intent] || [];
  return keys.map(key => {
    const header = getHeaderForIntent(intent);
    const dataString = craniumData[key];
    if (dataString) {
      try {
        const cleanJsonString = JSON.stringify(JSON.parse(dataString));
        return `${header}\n${cleanJsonString}`;
      } catch (error) {
        console.error(`Error parsing ${key} data:`, error);
        return `${header}\n${dataString}`;
      }
    }
    return '';
  }).join('\n\n');
}

function generateUniqueId(): string {
  return "uniqueId" + Date.now();
}

function getHeaderForIntent(intent: string): string {
  switch (intent) {
    case "option":
      return "\n\nChoices (Inactive & Active):";
    case "draft":
      return "\n\Choices:";
    case "advice":
      return "\n\nCoach Feedback:";
    case "documentation":
      return "\n\nDocumentation:";
    default:
      return "";
  }
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

  const contextInstructions = `\n\nUse the following context to help with your answer.`;
  const humanReadableRule = `In your response: You must never refer to an object by their ID (e.g. "experience-, experience-, skills-, education-, personal-"), instead use a human-readable name or reference from that object. Never say "Based on the context provided...", because that breaks immersion.`;

  let enhancedMessage = lastMessage;
  const relevantContext = generateRelevantContext(intent.classification, craniumData);

  if (relevantContext) {
    enhancedMessage += `${contextInstructions}

<RelevantContext>
${relevantContext}
</RelevantContext>

${humanReadableRule}`;
  }

  const enrichedUserLastMessage: ChatMessage = {
    id: generateUniqueId(),
    createdAt: new Date().toISOString(),
    role: "user",
    content: enhancedMessage,
  };

  let messages: CoreMessage[];

  if (intent.classification === 'documentation') {
    // For documentation intent, only use the enriched user message
    messages = [
      {
        role: "user",
        content: enrichedUserLastMessage.content,
      },
    ];
  } else {
    // For other intents, include chat history
    const chatDataResult = await fetchCranium(sessionId, userId, "chat");
    let chatData: ChatMessage[] = [];
    if (chatDataResult.success && typeof chatDataResult.data === "string") {
      try {
        chatData = JSON.parse(chatDataResult.data) as ChatMessage[];
      } catch (error) {
        console.error("Failed to parse chat data:", error);
      }
    }
    chatData.push(enrichedUserLastMessage);

    messages = chatData.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
  }

  const systemMessage = buildSystemMessage(intent.classification);

  const result = await streamText({
    system: systemMessage,
    model: openai("mistralai/Mixtral-8x7B-Instruct-v0.1"),
    messages: messages,
  });

  return result.toDataStreamResponse();
}