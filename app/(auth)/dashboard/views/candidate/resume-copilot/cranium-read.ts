"use server";
import { initializeRedis } from "@/lib/redis/connect";
import {
  Item,
  HistoryItems as HistoryItemType,
} from "@/app/(auth)/dashboard/views/candidate/resume-copilot/types";
import { Message as AIMessage } from "ai/react";
import { NextStep } from "@/app/(auth)/dashboard/views/candidate/resume-copilot/types";

interface ExtendedAIMessage extends AIMessage {
  nextStep?: NextStep;
}

// Define the different item types
type ChoiceItems = Record<string, Item[]>;
type HistoryItems = Array<HistoryItemType>;
type FeedbackItems = { feedback: string };
type ChatMessageItems = ExtendedAIMessage[];

// Define a mapping from cacheKeyType to its corresponding data type
type CacheTypeMap = {
  choice: ChoiceItems;
  history: HistoryItems;
  feedback: FeedbackItems;
  chat: ChatMessageItems;
};

type CacheKeyType = keyof CacheTypeMap;

type CraniumOutput<T extends CacheKeyType> =
  | { success: true; data: string }
  | { success: false; message: string };

export default async function fetchCranium<T extends CacheKeyType>(
  sessionId: string,
  userId: string,
  cacheKeyType: T
): Promise<CraniumOutput<T>> {
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

  const cacheKey = `cranium:${userId}:${sessionId}:${cacheKeyType}`;

  try {
    const rawData = await redis.get(cacheKey);

    if (rawData === null || rawData === undefined) {
      return { success: false, message: `No data found for ${cacheKeyType}` };
    }

    // Ensure rawData is a string
    const dataString =
      typeof rawData === "string" ? rawData : JSON.stringify(rawData);

    return {
      success: true,
      data: dataString,
    };
  } catch (error) {
    console.error(`Error retrieving items for ${cacheKeyType}:`, error);
    return {
      success: false,
      message: `Failed to retrieve items for ${cacheKeyType}`,
    };
  } finally {
    // Close the Redis connection if necessary
    // Uncomment the following line if your Redis client requires manual disconnection
    // await redis.disconnect();
  }
}
