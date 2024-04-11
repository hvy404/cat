"use server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { TogetherAIEmbeddings } from "@langchain/community/embeddings/togetherai";

const config = {
  url: "bolt+s://a2e06c19.databases.neo4j.io", // URL for the Neo4j instance
  username: "neo4j", // Username for Neo4j authentication
  password: "nqrBFW4wmRXTRhfm0LmOLn3wU21bU1iRS6hIVSKEdvo", // Password for Neo4j authentication
  indexName: "vector", // Name of the vector index
  keywordIndexName: "keyword", // Name of the keyword index if using hybrid search
  searchType: "vector" as const, // Type of search (e.g., vector, hybrid)
  nodeLabel: "Chunk", // Label for the nodes in the graph
  textNodeProperty: "text", // Property of the node containing text
  embeddingNodeProperty: "embedding", // Property of the node containing embedding
};

export async function ingestResume() {
  // Init TogetherAI
  const embeddings = new TogetherAIEmbeddings({
    apiKey: process.env.TOGETHER_API_KEY,
    model: "togethercomputer/m2-bert-80M-2k-retrieval",
  });

  const loader = new PDFLoader(
    "docs/23a3fb53-06cc-4942-bede-d628345dcb3f.pdf",
    {
      parsedItemSeparator: "",
      splitPages: false,
    }
  );

  const docs = await loader.load();

  console.log(docs);

  // We shouldn't need to chunk this small text
  /*  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 15,
  });

  const texts = await splitter.splitDocuments(docs); */

  // Log the split content
  return true;
}
