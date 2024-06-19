import OpenAI from "openai";

// TogetherAI API client
const embeddingModel = "togethercomputer/m2-bert-80M-8k-retrieval";
const togetherai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://api.together.xyz/v1",
});

/**
 * Generates embeddings for the given input.
 * @param input - The input string for which embeddings need to be generated.
 * @returns The generated embeddings.
 */

export async function generateEmbeddings(input: string) {
  const generate = await togetherai.embeddings.create({
    model: embeddingModel,
    input: input,
  });

  const result = generate.data[0].embedding;

  return result;
}
