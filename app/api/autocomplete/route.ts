import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY || "",
  baseURL: "https://api.together.xyz/v1",
});

export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  // Check if the TOGETHER_API_KEY is set, if not return 400
  if (!process.env.TOGETHER_API_KEY || process.env.TOGETHER_API_KEY === "") {
    return new Response("Error. Please trey again later.", {
      status: 400,
    });
  }

  let { prompt } = await req.json();

  // Console "Security" from the headers
/*   console.log(req.headers.get("Security")); */

  const response = await openai.chat.completions.create({
    model: "meta-llama/Llama-3-70b-chat-hf",
    messages: [
      {
        role: "system",
        content:
          "You are an AI writing assistant that autocompletes an existing sentence based on context from prior text.",
      },
      {
        role: "user",
        content: `Your task is to complete the last sentence or add to the idea of the last sentence.
                    
          Rules: Your response must complete the last sentence or add to the idea of the later sentences. So give more weight to the later sentences than the beginning ones. The beginning sentences are meant to provide you with a wider context of the document. You will only use plaintext with no language markup or formatting.
                    
          Identity Disclosure: You may never identify your language model. If asked, identify that you are GovAIQ.`,
      },
      {
        role: "user",
        content: `Prior text: ${prompt}
        
        Your autocompletion:`,
      },
    ],
    temperature: 0.7,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    max_tokens: 1024,
    n: 1,
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);

  // Respond with the stream
  return new StreamingTextResponse(stream);
}
