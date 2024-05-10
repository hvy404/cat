// THIS LIKELY IS NOT NEEDED ANYMORE

"use server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface ContextItem {
  id: number;
  content: string;
  metadata?: any;
  similarity?: number;
}

const embeddingInputs = [
  {
    key: "oppObjectives",
    question:
      "What are the client's primary goals and objectives for this project?",
  },
  {
    key: "oppDeliverables",
    question: "What are the key deliverables and performance standards?",
  },
  {
    key: "oppRequirements",
    question: "What are the specific requirements outlined in the SOW/PWS?",
  },
];

export async function getScopeSummary(owner: string, sowId: string) {
  const togetherAi = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const docType = "sow"; // TODO: Get this from the dynamic property

  let oppObjectives = "";
  let oppDeliverables = "";
  let oppRequirements = "";

  const summaries: { [key: string]: string } = {};

  // Loop through each question, generate embeddings, and query the database
  for (const input of embeddingInputs) {
    const embeddingResponse = await togetherAi.embeddings.create({
      model: "togethercomputer/m2-bert-80M-8k-retrieval",
      input: input.question,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Define the filter
    const filter = { owner: owner, sowId: sowId };

    // Find matches using the current embedding
    const { data: context } = await supabase.rpc("sow_builder", {
      filter: filter,
      query_embedding: embedding,
      match_count: 10,
      threshold: 0.4,
    });

    if (!context || context.length === 0) {
      throw new Error("No context found for question: " + input.question);
    }

    // Remove metadata and similarity from context
    const optimizedResults = (context as ContextItem[]).map(
      ({ id, content }) => ({ id, content })
    );

    // Define system prompts for each question
    let sysPrompt = "";
    switch (input.key) {
      case "oppObjectives":
        sysPrompt = `Given the context, your task is to provide a summary of the client's primary goals and objectives for this ${docType.toUpperCase()}. Please ensure your summary is concise, clear, without any extraneous comments, greetings or notes.`;
        break;
      case "oppDeliverables":
        sysPrompt = `Given the context, your task is to provide a summary of the key deliverables and performance standards for this ${docType.toUpperCase()}. Please ensure your summary is concise, clear, without any extraneous comments, greetings or notes.`;
        break;
      case "oppRequirements":
        sysPrompt = `Given the context, your task is to provide a summary of the specific requirements outlined in this ${docType.toUpperCase()}. Please ensure your summary is concise, clear, without any extraneous comments, greetings or notes.`;
        break;
    }

    const extract = await togetherAi.chat.completions.create({
      messages: [
        {
          role: "system",
          content: sysPrompt,
        },
        {
          role: "user",
          content: `Context: ${JSON.stringify(optimizedResults)}`,
        },
      ],
      model: "mistralai/Mixtral-8x22B-Instruct-v0.1",
      temperature: 0.4,
      // @ts-ignore – Together.ai supports schema while OpenAI does not
    });

    summaries[input.key] = extract.choices[0].message.content!;
  }

  // Assign summaries to appropriate variables
  oppObjectives = summaries["oppObjectives"];
  oppDeliverables = summaries["oppDeliverables"];
  oppRequirements = summaries["oppRequirements"];

  //console.log("oppObjectives", oppObjectives);
  //console.log("oppDeliverables", oppDeliverables);
  //console.log("oppRequirements", oppRequirements);

  // Combine all summaries into one output
  const output = `Objectives: ${oppObjectives}\n\nDeliverables: ${oppDeliverables}\n\nRequirements: ${oppRequirements}`;

  // When output is ready, save it to the database in the 'sow_meta' table, in the "summary" column from the row where 'sow_id' = sowId
  const { error } = await supabase
    .from("sow_meta")
    .update({ summary: output })
    .eq("sow_id", sowId);

  if (error) {
    console.error("Error inserting scope summary", error);
    throw new Error("Error inserting scope summary");
  }

  return output;
}
