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
    const companyID = event.data.job_description.company;

    try {
      const { data, error } = await supabase
        .from("job_postings")
        .select(
          "static, inferred, role_names, salary_disclose, compensation_type, hourly_comp_min, hourly_comp_max, private_employer, title, location_type, min_salary, max_salary, security_clearance, commission_pay, commission_percent, ote_salary, location"
        )
        .eq("jd_id", jobDescriptionID);

      if (error) throw new Error(error.message);

      if (data.length === 0) {
        throw new Error("No job description found with the given ID.");
      }

      // Static and inferred data is AI generated data from the JD ingestion process
      // We need to merge this data with the user edited data to get the final job description data
      const staticData = data[0].static;
      const inferredData = data[0].inferred;
      const roleNames = data[0].role_names;
      const jobDescriptionData = {
        ...staticData,
        ...inferredData,
        ...roleNames,
      };

      // Update jobDescriptionData with newer data that user may have edited
      jobDescriptionData.salaryDisclose = data[0].salary_disclose;
      jobDescriptionData.compensationType = data[0].compensation_type;
      jobDescriptionData.hourlyCompMin = data[0].hourly_comp_min;
      jobDescriptionData.hourlyCompMax = data[0].hourly_comp_max;
      jobDescriptionData.privateEmployer = data[0].private_employer;
      jobDescriptionData.jobTitle = data[0].title;
      jobDescriptionData.locationType = data[0].location_type;
      jobDescriptionData.minSalary = data[0].min_salary;
      jobDescriptionData.maxSalary = data[0].max_salary;
      jobDescriptionData.clearanceLevel = data[0].security_clearance;
      jobDescriptionData.commissionPay = data[0].commission_pay;
      jobDescriptionData.commissionPercent = data[0].commission_percent;
      jobDescriptionData.oteSalary = data[0].ote_salary;
      jobDescriptionData.location = data[0].location
        ? data[0].location.map(
            (loc: { city: string; state: string; zipcode: string }) => ({
              city: loc.city,
              state: loc.state,
              zipcode: loc.zipcode,
            })
          )
        : null;

      const cypherQuery = generateJobCypherQuery(
        jobDescriptionData,
        jobDescriptionID,
        employerID,
        companyID
      );

      //console.log(cypherQuery);

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
    }
  }
);
