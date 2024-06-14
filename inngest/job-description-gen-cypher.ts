/**
 * Generates a Cypher query to add a JD to Neo4j and start embeddings generation.
 *
 * @param event - The event object containing the data for the candidate.
 * @param step - The step object containing additional information about the workflow step.
 * @returns A Promise that resolves to an object with a success message if the operation is successful, or an error message if it fails.
 */
import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { generateJobCypherQuery } from "@/lib/dashboard/generate-cypher-query";
import { write } from "@/lib/neo4j/utils";

export const generateJobDescriptionCypher = inngest.createFunction(
  { id: "job-description-add-to-neo-workflow" },
  { event: "app/job-description-add-to-neo-workflow" },
  async ({ event, step }) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const jobDescriptionID = event.data.job_description.id;
    const employerID = event.data.job_description.employer;

    try {
      const { data, error } = await supabase
        .from("job_postings")
        .select("static, inferred")
        .eq("jd_uuid", jobDescriptionID);

      if (error) throw new Error(error.message);

      // TODO: This doesnt take in account of the any changes the user may have made to the job description. 
      // We will need to update with any new values the user may have added to the job description.

      const staticData = data[0].static;
      const inferredData = data[0].inferred;
      const jobDescriptionData = { ...staticData, ...inferredData };

      console.log(JSON.stringify(jobDescriptionData));

      const cypherQuery = generateJobCypherQuery(
        jobDescriptionData,
        jobDescriptionID,
        employerID
      );

      //console.log(cypherQuery);

      //console.log( "Writing then sending cypher query to Neo4j from candidate-add-to-neo-workflow Inngest function.");

      // Run the Cypher query and wait for it to complete successfully
      // TODO: Write doesn't return an error and thus does not throw an error. This needs enhancement
      await write(cypherQuery);

      return {
        message:
          "Successfully added job description to Neo and started embeddings generation.",
        success: true,
      };
    } catch (err) {
      throw new Error("There was an error executing the operation: " + err);
      /* return {
        message: "Failed to execute the operation.",
        error: "Error executing write operation in Neo4j:",
        success: false,
      }; */
    }
  }
);
