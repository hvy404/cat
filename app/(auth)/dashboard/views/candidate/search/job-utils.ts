"use server";
import { read } from "@/lib/neo4j/utils";

export type DetailedJobResult = {
  job_id: string;
  job_title: string;
  company: string;
  security_clearance: string;
  location: string;
  score: number;
  experience: string;
  client: string;
  job_type: string;
  remote_flexibility: boolean;
  company_overview: string;
  advancement_potential: boolean;
  employer_id: string;
  location_type: string;
  summary: string;
  salary_disclose: boolean;
  private_employer: boolean;
  compensation_type: string;
  maximum_salary: number;
  starting_salary: number;
  commission_percent: number;
  commission_pay: boolean;
  ote_salary: number;
  hourly_comp_min: number;
  hourly_comp_max: number;
};

export async function findSimilarJobs(
  embedding: number[],
  threshold: number
): Promise<DetailedJobResult[]> {
  const query = `
      CALL db.index.vector.queryNodes('job-embeddings', 50, $embedding)
      YIELD node AS similarJob, score
      WHERE score >= $threshold AND similarJob:Job
      RETURN 
        similarJob { 
          .job_id, 
          .job_title, 
          .company,
          .security_clearance,
          .location,
          .experience,
          .client,
          .job_type,
          .remote_flexibility,
          .company_overview,
          .advancement_potential,
          .employer_id,
          .location_type,
          .summary,
          .salary_disclose,
          .private_employer,
          .compensation_type,
          .maximum_salary,
          .starting_salary,
          .commission_percent,
          .commission_pay,
          .ote_salary,
          .hourly_comp_min,
          .hourly_comp_max
        } AS similarJob,
        score
    `;

  const params = { embedding, threshold };

  try {
    const result = await read(query, params);

    const similarJobsPlain: DetailedJobResult[] = result.map(
      ({ similarJob, score }) => ({
        job_id: similarJob.job_id,
        job_title: similarJob.job_title,
        company: similarJob.company,
        security_clearance: similarJob.security_clearance,
        location: similarJob.location,
        score,
        experience: similarJob.experience,
        client: similarJob.client,
        job_type: similarJob.job_type,
        remote_flexibility: similarJob.remote_flexibility,
        company_overview: similarJob.company_overview,
        advancement_potential: similarJob.advancement_potential,
        employer_id: similarJob.employer_id,
        location_type: similarJob.location_type,
        summary: similarJob.summary,
        salary_disclose: similarJob.salary_disclose,
        private_employer: similarJob.private_employer,
        compensation_type: similarJob.compensation_type,
        maximum_salary: similarJob.maximum_salary,
        starting_salary: similarJob.starting_salary,
        commission_percent: similarJob.commission_percent,
        commission_pay: similarJob.commission_pay,
        ote_salary: similarJob.ote_salary,
        hourly_comp_min: similarJob.hourly_comp_min,
        hourly_comp_max: similarJob.hourly_comp_max,
      })
    );

    return similarJobsPlain;
  } catch (error) {
    console.error("We encountered an error while finding similar jobs");
    throw error;
  }
}

export async function getJobProperties(jobId: string) {
  const query = `
    MATCH (j:Job {job_id: $jobId})
    RETURN j
  `;

  const params = { jobId };

  try {
    const result = await read(query, params);
    const jobProperties = result[0]?.j.properties;
    return jobProperties;
  } catch (error) {
    console.error("We encountered an error while fetching job properties");
    throw error;
  }
}

export async function getJobRelationships(jobId: string) {
  const query = `
    MATCH (j:Job {job_id: $jobId})-[r]->(n)
    RETURN type(r) AS type, n
  `;

  const params = { jobId };

  try {
    const result = await read(query, params);
    const jobRelationships = result.map((record) => ({
      type: record.type,
      node: record.node.properties,
    }));
    return jobRelationships;
  } catch (error) {
    console.error("We encountered an error while fetching job details.");
    throw error;
  }
}
