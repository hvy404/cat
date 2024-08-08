"use server";
import { initializeRedis } from "@/lib/redis/connect";
import { Item, HistoryItems as HistoryItemType } from "@/app/(auth)/dashboard/views/candidate/resume-copilot/types";
import { Message as AIMessage } from "ai/react";
import { NextStep } from "@/app/(auth)/dashboard/views/candidate/resume-copilot/types";

const CACHE_TTL = 86400; // 24 hours in seconds

interface ExtendedAIMessage extends AIMessage {
  nextStep?: NextStep;
}

// Define the different item types
type ChoiceItems = Record<string, Item[]>;
type HistoryItems = Array<HistoryItemType>;
type FeedbackItems = { feedback: string };
type ChatMessageItems = ExtendedAIMessage[];

// union type
type CraniumInput =
  | { cacheKeyType: "choice"; items: ChoiceItems }
  | { cacheKeyType: "history"; items: HistoryItems }
  | { cacheKeyType: "feedback"; items: FeedbackItems }
  | { cacheKeyType: "chat"; items: ChatMessageItems };

export default async function cranium(
  sessionId: string,
  userId: string,
  input: CraniumInput
) {
  let redis;

  try {
    redis = initializeRedis();
  } catch (error) {
    console.error("Failed to initialize Redis:", error);
    return { success: false, message: "Failed to connect to the cache" };
  }

  if (!sessionId || !userId) {
    return { success: false, message: "Invalid sessionId or userId" };
  }

  const { cacheKeyType, items } = input;
  const cacheKey = `cranium:${userId}:${sessionId}:${cacheKeyType}`;

  try {
    // Validate items
    if (!items || (typeof items === 'object' && Object.keys(items).length === 0)) {
      return { success: false, message: "No items to store" };
    }

    // Store the items as raw JSON
    await redis.set(cacheKey, JSON.stringify(items), { ex: CACHE_TTL });

    return {
      success: true,
      message: `Updated ${cacheKeyType}`,
    };
  } catch (error) {
    console.error(`Error storing items for ${cacheKeyType}:`, error);
    return {
      success: false,
      message: `Failed to store items for ${cacheKeyType}`,
    };
  } finally {
    // Close the Redis connection if necessary
    // Uncomment the following line if your Redis client requires manual disconnection
    // await redis.disconnect();
  }
}