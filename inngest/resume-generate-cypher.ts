import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { generateCandidateCypherQuery } from "@/lib/candidate/ingest-resume/generate-cypher-query";
import { read, write } from "@/lib/neo4j/utils";

export const generateCandidateCypher = inngest.createFunction(
  { id: "candidate-add-to-neo-workflow" },
  { event: "app/candidate-add-to-neo-workflow" },
  async ({ event, step }) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const userId = event.data.user.id;

    try {
      const { data, error } = await supabase
        .from("candidate_resume")
        .select("static, inferred")
        .eq("user", userId);

      if (error) throw new Error(error.message);

      const staticData = data[0].static;
      const inferredData = data[0].inferred;
      const candidateData = { ...staticData, ...inferredData };
      const cypherQuery = generateCandidateCypherQuery(candidateData, userId);

      console.log("Writing then sending cypher query to Neo4j from candidate-add-to-neo-workflow Inngest function.");

      // Run the Cypher query and wait for it to complete successfully
      await write(cypherQuery);

      // Send #4 step event to start embeddings generation and add to Neo
      await step.sendEvent("onboard-candidate-embeddings", {
          name: "app/candidate-generate-neo-embeddings",
          data: { user: { id: userId } },
      });

      return {
        message: "Successfully added candidate to Neo and started embeddings generation.",
        success: true,
      };
    } catch (err) {
      console.error(err);
      return {
        message: "Failed to execute the operation.",
        error: "Error executing write operation in Neo4j:",
        success: false,
      };
    }
  }
);