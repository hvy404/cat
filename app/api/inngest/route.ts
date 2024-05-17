import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { resumeExtract } from "@/inngest/resume-start-onboard";
import { resumeGenerateStatic } from "@/inngest/resume-static";
import { resumeGenerateInferred } from "@/inngest/resume-inferred";
import { generateCandidateCypher } from "@/inngest/resume-generate-cypher";
import { resumeGenerateEmbeddings } from "@/inngest/resume-embeddings";
import { generateJobDescriptionCypher } from "@/inngest/job-description-gen-cypher";
import { jobDescriptionEmbeddings } from "@/inngest/job-generate-embeddings";
import { jobDescriptionOnboard } from "@/inngest/job-description-start-loading";
import { jobDescriptionGenerateStatic } from "@/inngest/job-description-static";
import { jobDescriptionGenerateInferred } from "@/inngest/job-description-inferred";
import { jobDescriptionAddStructured } from "@/inngest/job-description-sql";
import { jobDescriptionGenerateCompleted } from "@/inngest/job-description-completed";
import { jdWizardOnboardDocs } from "@/inngest/jd-wizard-onboard-start"; // JD Wizard - Start onboarding
import { jdWizardDetectRoles } from "@/inngest/jd-wizard-detect-roles"; // JD Wizard - Detect roles
import { jdWizardProcessSow } from "@/inngest/jd-wizard-chunk"; 
import { jdWizardFindDocType } from "@/inngest/jd-wizard-doc-identify"; 
import { jdWizardGetKeyPersonnel } from "@/inngest/jd-wizard-get-key-personnel"; 
import { jdWizardGetPersonnel } from "@/inngest/jd-wizard-get-personnel"; 
import { jdGenerateDescription } from "@/inngest/jd-wizard-generate-jd"; // JD Wizard - Generate JD function

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
    resumeExtract,
    resumeGenerateStatic,
    resumeGenerateInferred,
    generateCandidateCypher,
    resumeGenerateEmbeddings,
    generateJobDescriptionCypher,
    jobDescriptionEmbeddings,
    jobDescriptionOnboard,
    jobDescriptionGenerateStatic,
    jobDescriptionGenerateInferred,
    jobDescriptionAddStructured,
    jobDescriptionGenerateCompleted,
    jdWizardOnboardDocs,
    jdWizardDetectRoles,
    jdWizardProcessSow,
    jdWizardFindDocType,
    jdWizardGetKeyPersonnel,
    jdWizardGetPersonnel,
    jdGenerateDescription,
  ],
});
