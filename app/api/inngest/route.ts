import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { resumeExtract } from "@/inngest/resume-start-onboard";
import { resumeGenerateStatic } from "@/inngest/resume-static";
import { resumeGenerateInferred } from "@/inngest/resume-inferred";
import { generateCandidateCypher } from "@/inngest/resume-generate-cypher";
import { resumeGenerateEmbeddings } from "@/inngest/resume-embeddings";

/**
 * Represents the serve function for handling HTTP requests.
 * @param {object} options - The options for serving requests.
 * @param {object} options.client - The client object for making requests.
 * @param {Array<Function>} options.functions - The array of functions to be passed later.
 * @returns {object} - The GET, POST, and PUT methods for handling HTTP requests.
 */

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    resumeExtract, resumeGenerateStatic, resumeGenerateInferred, generateCandidateCypher, resumeGenerateEmbeddings
  ],
});
