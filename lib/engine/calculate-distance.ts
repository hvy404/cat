"use server";

/**
 * Calculates the cosine similarity between two embeddings.
 * @param embedding1 - The first embedding array.
 * @param embedding2 - The second embedding array.
 * @returns The cosine similarity between the two embeddings.
 * @throws {Error} If either embedding does not have 768 dimensions.
 * @throws {Error} If either embedding is a zero vector, which will cause division by zero.
 */
export async function calculateSimilarity(
  embedding1: number[],
  embedding2: number[]
): Promise<number> {
  if (embedding1.length !== 768 || embedding2.length !== 768) {
    throw new Error("Both embeddings must have 768 dimensions");
  }

  const dotProduct = embedding1.reduce(
    (sum, val, i) => sum + val * embedding2[i],
    0
  );
  const magnitude1 = Math.sqrt(
    embedding1.reduce((sum, val) => sum + val * val, 0)
  );
  const magnitude2 = Math.sqrt(
    embedding2.reduce((sum, val) => sum + val * val, 0)
  );

  if (magnitude1 === 0 || magnitude2 === 0) {
    throw new Error(
      "One of the embeddings is a zero vector, which will cause division by zero"
    );
  }

  const cosineSimilarity = dotProduct / (magnitude1 * magnitude2);
  return Promise.resolve(cosineSimilarity);
}
