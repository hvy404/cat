"use server";
import OpenAI from 'openai';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { inferredJDSchema } from './inferredSchema';

const jsonSchema = zodToJsonSchema(inferredJDSchema, 'JDSchema');

const togetherai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: 'https://api.together.xyz/v1',
});

export async function generateLiftedInferredJD(jobDescription: string) {
  console.log('Generating inferred JD data');

  const extract = await togetherai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
        'The following is job description data. Use the job description data to populate relevant fields the job description schema, and answer in JSON. If key values are not relevant, leave it empty. Do not make anything up.',
      },
      {
        role: 'user',
        content: JSON.stringify(jobDescription),
      },
    ],
    model: 'mistralai/Mistral-7B-Instruct-v0.1',
    max_tokens: 4000,
    temperature: 0.3,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
    response_format: { type: 'json_object', schema: jsonSchema },
  });

  const output = JSON.parse(extract.choices[0].message.content!);
  
  console.log({ output });

  // Serialize the output to JSON and return to client
  return JSON.stringify(output, null, 2);

}
