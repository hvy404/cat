"use server";
import OpenAI from "openai";

const togetherai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://api.together.xyz/v1",
});

const embeddingModel = "togethercomputer/m2-bert-80M-8k-retrieval";

export async function generateEmbedding(
    query: string
): Promise<number[]> {  // Assuming the embeddings are an array of numbers
  const embeddingsResponse = await togetherai.embeddings.create({
    model: embeddingModel,
    input: query,
  });

  // Assuming the embeddings are in embeddingsResponse.data
  return embeddingsResponse.data[0].embedding;
}
