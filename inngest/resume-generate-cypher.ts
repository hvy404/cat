import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { generateCandidateCypherQuery } from "@/lib/candidate/ingest-resume/generate-cypher-query";

export const generateCandidateCypher = inngest.createFunction(
  { id: "candidate-generate-cypher-query" },
  { event: "app/candidate-generate-cypher" },
  async ({ event, step }) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const userId = event.data.user.id;

    // Get 'static' and 'inferred' data from the Supabase 'candidate_resume' table where 'user' column is eq. to userId
    const { data, error } = await supabase
      .from("candidate_resume")
      .select("static, inferred")
      .eq("user", userId);

    if (error) {
      console.error(error);
      return {
        message: "Failed to get candidate data.",
        error: error,
      };
    }

    let staticData = data[0].static;
    let inferredData = data[0].inferred;

    // Merge 'static' and 'inferred' data into a single object
    let candidateData = { ...staticData, ...inferredData };

    // Generate cypher query
    const cypherQuery = generateCandidateCypherQuery(candidateData, userId);

    //console.log(cypherQuery);

    return { count: "1" };
  }
);
