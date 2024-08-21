"use server";
import { read } from "@/lib/neo4j/utils";

export type DetailedJobResult = {
  job_id: string;
  job_title: string;
  company?: string;
  security_clearance: string;
  location: string;
  score: number;
  experience: string;
  client: string;
  job_type: string;
  remote_flexibility: boolean;
  company_overview: string;
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

export async function remapJobType(type: string): Promise<string> {
  const jobTypeMap: { [key: string]: string } = {
    "full-time": "Full-Time",
    "part-time": "Part-Time",
    "contract": "Contract",
    "temporary": "Temporary",
    // Add more mappings as needed
  };

  return jobTypeMap[type.toLowerCase()] || type;
}

export async function remapJobProperties(
  jobType: string,
  locationType: string,
  securityClearance: string
): Promise<{ jobType: string; locationType: string; securityClearance: string }> {
  const remappedJobType = await remapJobType(jobType);

  const remapLocationType = async (type: string): Promise<string> => {
    switch (type.toLowerCase()) {
      case "remote":
        return "Remote";
      case "onsite":
        return "On Site";
      case "hybrid":
        return "Hybrid";
      default:
        return type;
    }
  };

  const remapClearanceLevel = async (level: string): Promise<string> => {
    switch (level.toLowerCase()) {
      case "none":
        return "Unclassified";
      case "basic":
        return "Public Trust";
      case "confidential":
        return "Secret";
      case "critical":
        return "Top Secret";
      case "paramount":
        return "Top Secret/SCI";
      case "q_clearance":
        return "Q Clearance";
      case "l_clearance":
        return "L Clearance";
      default:
        return level;
    }
  };

  const remappedLocationType = await remapLocationType(locationType);
  const remappedSecurityClearance = await remapClearanceLevel(securityClearance);

  return {
    jobType: remappedJobType,
    locationType: remappedLocationType,
    securityClearance: remappedSecurityClearance,
  };
}

export async function findSimilarJobs(
  embedding: number[],
  threshold: number
): Promise<DetailedJobResult[]> {
  const query = `
      CALL db.index.vector.queryNodes('job-embeddings', 100, $embedding)
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

    const similarJobsPlain: DetailedJobResult[] = await Promise.all(result.map(
      async ({ similarJob, score }) => {
        const remappedProperties = await remapJobProperties(
          similarJob.job_type,
          similarJob.location_type,
          similarJob.security_clearance
        );

        const jobResult: DetailedJobResult = {
          job_id: similarJob.job_id,
          job_title: similarJob.job_title,
          security_clearance: remappedProperties.securityClearance,
          location: similarJob.location,
          score,
          experience: similarJob.experience,
          client: similarJob.client,
          job_type: remappedProperties.jobType,
          remote_flexibility: similarJob.remote_flexibility,
          company_overview: similarJob.company_overview,
          employer_id: similarJob.employer_id,
          location_type: remappedProperties.locationType,
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
        };

        // Only include company if private_employer is false
        if (!similarJob.private_employer) {
          jobResult.company = similarJob.company;
        }

        return jobResult;
      }
    ));

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
    
    if (jobProperties) {
      const remappedProperties = await remapJobProperties(
        jobProperties.job_type,
        jobProperties.location_type,
        jobProperties.security_clearance
      );

      return {
        ...jobProperties,
        job_type: remappedProperties.jobType,
        location_type: remappedProperties.locationType,
        security_clearance: remappedProperties.securityClearance,
      };
    }

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

export async function fullTextSearchAlternativeTitles(
  searchTerm: string
): Promise<any[]> {
  const query = `
    CALL db.index.fulltext.queryNodes("alternativeTitleIndex", $searchTerm) YIELD node as alternativeTitle, score
    MATCH (job:Job)-[:HAS_ALTERNATIVE_TITLE]->(alternativeTitle)
    RETURN alternativeTitle.name, job.job_id, score
    ORDER BY score DESC
  `;

  const params = { searchTerm: `${searchTerm}~2` };

  try {
    const result = await read(query, params);
    return result.map((record: any) => ({
      name: record["alternativeTitle.name"],
      job_id: record["job.job_id"],
      score: record.score,
    }));
  } catch (error) {
    console.error("Error executing full-text search query for AlternativeTitles:", error);
    throw error;
  }
}

export async function getJobNodesByIds(jobIds: string[]): Promise<DetailedJobResult[]> {
  const query = `
    MATCH (j:Job)
    WHERE j.job_id IN $jobIds
    RETURN j
  `;

  const params = { jobIds };

  try {
    const result = await read(query, params);
    const jobNodes = result.map(record => record.j.properties);

    return Promise.all(jobNodes.map(async (job) => {
      const remappedProperties = await remapJobProperties(
        job.job_type,
        job.location_type,
        job.security_clearance
      );

      return {
        ...job,
        job_type: remappedProperties.jobType,
        location_type: remappedProperties.locationType,
        security_clearance: remappedProperties.securityClearance,
      };
    }));
  } catch (error) {
    console.error("Error fetching Job nodes by IDs:", error);
    throw error;
  }
}
