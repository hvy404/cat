import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { enrichStatic } from "@/lib/candidate/manual-resume-upload/enrich-static";
import { generateSupplementalData } from "@/lib/candidate/manual-resume-upload/build-inferred-points";

export const processManualResumeStart = inngest.createFunction(
  { id: "manual-resume-enrich" },
  { event: "app/manual-resume-enrich" },
  async ({ event, step }) => {
    const { candidateId } = event.data;
    const supabase = createClient(cookies());

    const { data, error } = await step.run("Fetch Resume Data", async () => {
      return supabase
        .from("candidate_create")
        .select("static")
        .eq("user", candidateId)
        .single();
    });

    if (error) {
      console.error("Error fetching resume data:", error);
      throw error;
    }

    if (!data || !data.static) {
      console.error("No resume data found for candidate:", candidateId);
      throw new Error("No resume data found");
    }

    const resumeData = data.static;

    const enrichedData = await step.run("Enrich Static Data", async () => {
      return await enrichStatic(resumeData);
    });

    const updatedResumeData = await step.run("Update Resume Data", async () => {
      return {
        ...resumeData,
        technical_skills: enrichedData.technical_skills || [],
        industry_experience: enrichedData.industry_experience || [],
      };
    });

    // Generarate inferred data - call generateInferredData
    const inferredData = await step.run("Generate Inferred Data", async () => {
      return await generateSupplementalData(updatedResumeData, candidateId);
    });

    // Run the additional steps
    await step.run("Generate Candidate Cypher", async () => {
      await inngest.send({
        name: "app/candidate-add-to-neo-workflow",
        data: { user: { id: candidateId } },
      });
    });

    await step.run("Generate Embeddings", async () => {
      await inngest.send({
        name: "app/candidate-generate-neo-embeddings",
        data: { user: { id: candidateId } },
      });
    });

    await step.run("Update Onboard Status", async () => {
      await inngest.send({
        name: "app/candidate-onboard-boolean-true",
        data: { user: { id: candidateId } },
      });
    });

    await step.run("Assemble Resume", async () => {
      await inngest.send({
        name: "app/resume-manual-assembly",
        data: { user: { id: candidateId } },
      });
    });

    return await step.run("Finalize Process", async () => {
      return {
        success: true,
        message: "Manual resume processed successfully",
        runId: event.id,
      };
    });
  }
);
