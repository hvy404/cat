"use server";
import OpenAI from "openai";

function generateCypher(
  indexName: string,
  embeddings: number[],
  topN: number
): string {
  let embeddingsString = embeddings.join(", ");
  let query = `CALL db.index.vector.queryNodes('${indexName}', ${topN}, [${embeddingsString}]) YIELD node AS similarTalent, score RETURN similarTalent, score`;
  return query;
}

export async function generateTestSearch(query: string) {
  const togetherai = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const embeddingsResponse = await togetherai.embeddings.create({
    model: "togethercomputer/m2-bert-80M-8k-retrieval",
    input: query,
  });

  // Extract the embeddings from the response
  const embeddings = embeddingsResponse.data[0].embedding;

  // Call the function to generate the cypher query
  const cypherQuery = generateCypher("talent-embeddings", embeddings, 5);

  console.log("Matches: ", cypherQuery);

  return embeddingsResponse;
}
