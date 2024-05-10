"use server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { zodToJsonSchema } from "zod-to-json-schema";
import { keyPersonnelTypeSchema } from "./schema/getKeyPersonnelSchema";

interface ContextItem {
  id: number;
  content: string;
  metadata?: any;
  similarity?: number;
}

export async function getKeyPersonnel(owner: string, sowId: string) {
  const docSchema = zodToJsonSchema(
    keyPersonnelTypeSchema,
    "keyPersonnelTypeSchema"
  );

  const togetherAi = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  let docType = "sow"; // TODO: Get this from the dynamic property

  let oppDeliverables = "";
  let oppRequirements = "";

  const summaries: { [key: string]: string } = {};

  // Questions for Part 1
  const embeddingInputs = [
    {
      key: "oppDeliverables",
      question: "What are the key deliverables and performance standards?",
    },
    {
      key: "oppRequirements",
      question: "What are the specific requirements outlined in the SOW/PWS?",
    },
  ];

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
  oppDeliverables = summaries["oppDeliverables"];
  oppRequirements = summaries["oppRequirements"];

  // Combine all summaries into one output
  const findings = `Deliverables: ${oppDeliverables}\n\nRequirements: ${oppRequirements}`;

  // Second part of the process

  const embeddingsResponse = await togetherAi.embeddings.create({
    model: "togethercomputer/m2-bert-80M-8k-retrieval",
    input:
      "Identify the key personnel roles and their qualifications requirements.",
  });

  // Extract the embeddings from the response
  const embeddings = embeddingsResponse.data[0].embedding;

  // Define the filter
  const filter = { owner: owner, sowId: sowId };

  // Find matches
  const { data: context, error } = await supabase.rpc("sow_builder", {
    filter: filter,
    query_embedding: embeddings,
    match_count: 13,
    threshold: 0.4,
  });

  if (error) {
    console.error("Error fetching data:", error);
  } else {
    //console.log("Context data:", context);
  }

  // If data: context is empty, return early error
  if (context.length === 0) {
    throw new Error("No context found");
  }

  // Remove metadata and similarity from context
  const optimizedResults = (context as ContextItem[]).map(
    ({ id, content }) => ({
      id,
      content,
    })
  );

  const systemPrompt = `As an experienced contract manager at a federal contracting firm, analyze the 'Opportunity Context' provided to identify the required Key Personnel roles based on the client's requirements. Your answer should be a list of role/job titles only, without any introductory text, comments, information, greetings, or notices.`;
  const convertToJSONPrompt = `You are a helpful AI assistant. Convert the identified Key Personnel roles to a JSON list.`;

  // Summarize the context
  const identifiedKeyRoles = await togetherAi.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `Opportunity Context: ${JSON.stringify(optimizedResults)}`,
      },
    ],
    model: "meta-llama/Llama-3-70b-chat-hf",
    temperature: 0.2,
  });

  let identifiedRolesList = identifiedKeyRoles.choices[0].message.content;

  // Summarize identifiedRolesList and findings
  const refinedRolesInstruction = `As an experienced contract manager at a federal contracting firm, your task is to review the 'Roles' and 'Scope Summary' sections. Based on the client's requirements outlined in the 'Scope Summary', evaluate the current list of Key Personnel roles. If any roles are missing that are necessary to fulfill the client's requirements, add them to the list. Conversely, if there are roles listed that are not relevant or necessary according to the 'Scope Summary', remove them. Your final output should be a refined list of role/job titles only, without any introductory text, comments, information, greetings, or notices.`;
  const refinedRoles = await togetherAi.chat.completions.create({
    messages: [
      {
        role: "system",
        content: refinedRolesInstruction,
      },
      {
        role: "user",
        content: `Roles: ${identifiedRolesList}\n\nScope Summary: ${findings}`,
      },
    ],
    model: "meta-llama/Llama-3-70b-chat-hf",
    temperature: 0.2,
  });

  let refinedRolesList = refinedRoles.choices[0].message.content;

  // Convert to structure JSON format using another LLM's JSON mode
  const extract = await togetherAi.chat.completions.create({
    messages: [
      {
        role: "system",
        content: convertToJSONPrompt,
      },
      {
        role: "user",
        content: `Roles: ${refinedRolesList}`,
      },
    ],
    model: "mistralai/Mistral-7B-Instruct-v0.1",
    temperature: 0.01,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
    response_format: { type: "json_object", schema: docSchema },
  });

  const output = JSON.parse(extract.choices[0].message.content!);

  if (output.length === 0) {
    throw new Error("No roles identified");
  }

  // Save to 'output' to key_personnel column in the 'sow_meta' table, in the row where 'sow_id' = sowId
  const { error: saveError } = await supabase
    .from("sow_meta")
    .update({ key_personnel: output })
    .eq("sow_id", sowId);

  if (saveError) {
    console.error("Error inserting key personnel", saveError);
    throw new Error("Error inserting key personnel");
  }

  return output;
}
