"use server";
import { write, read } from "@/lib/neo4j/utils";
import { RecordShape } from "neo4j-driver";
/*
 * MATCH Relationship in Neo4j
 *
 * The MATCH relationship represents a connection between a Talent node and a Job node,
 * indicating a potential match between a job seeker and a job posting.
 *
 * Structure:
 * (Talent)-[MATCHES]->(Job)
 *
 * Properties:
 * 1. match_score: number
 *    - Range: 0.0 to 1.0
 *    - Represents the strength of the match
 *    - Example: 0.85
 *
 * 2. match_strength: string
 *    - Possible values: "strong", "medium", "weak"
 *    - Derived from match_score:
 *      strong: >= 0.8
 *      medium: >= 0.6 and < 0.8
 *      weak: < 0.6
 *
 * 3. created_at: datetime
 *    - When the match was first created
 *    - Example: 2023-07-03T14:30:00Z
 *
 * 4. updated_at: datetime
 *    - When the match was last updated
 *    - Example: 2023-07-05T09:15:30Z
 *
 * 5. match_reasons: string[]
 *    - List of reasons why this match was made
 *    - Example: ["Skill match", "Experience level", "Location preference"]
 *
 * 6. skills_matched: string[]
 *    - List of skills that matched between the Talent and Job
 *    - Example: ["JavaScript", "React", "Node.js"]
 *
 * 7. application_status: string
 *    - Current status of the application
 *    - Possible values: "not_applied", "applied", "under_review", "rejected", "accepted"
 *    - Default: "not_applied"
 *
 * 8. last_viewed_by_talent: datetime
 *    - When the Talent last viewed this match
 *    - Null if never viewed
 *
 * 9. last_viewed_by_employer: datetime
 *    - When the Employer last viewed this match
 *    - Null if never viewed
 *
 * 10. email_sent_to_talent: datetime
 *     - When an email about this match was sent to the Talent
 *     - Null if no email sent
 *
 * 11. email_sent_to_employer: datetime
 *     - When an email about this match was sent to the Employer
 *     - Null if no email sent
 *
 * 12. talent_action: string
 *     - Action taken by the Talent
 *     - Possible values: "applied", "saved", "rejected", null (if no action taken)
 *
 * 13. employer_action: string
 *     - Action taken by the Employer
 *     - Possible values: "viewed", "contacted", "rejected", null (if no action taken)
 *
 * 14. interview_status: string
 *     - Current interview status
 *     - Possible values: "scheduled", "completed", "cancelled", null (if not applicable)
 *
 * 15. feedback: string
 *     - Any feedback provided by either party
 *     - Can be used to store comments or notes about the match
 *
 * Example Cypher query to create a MATCH relationship:
 *
 * MATCH (t:Talent {applicant_id: 'talent123'})
 * MATCH (j:Job {job_id: 'job456'})
 * CREATE (t)-[m:MATCHES]->(j)
 * SET m = {
 *   match_score: 0.85,
 *   match_strength: 'strong',
 *   created_at: datetime(),
 *   updated_at: datetime(),
 *   match_reasons: ['Skill match', 'Experience level'],
 *   skills_matched: ['JavaScript', 'React'],
 *   application_status: 'not_applied'
 * }
 * RETURN m
 *
 * Note: This structure allows for flexible querying and updating of match information,
 * supporting various features like match listing, filtering, and analytics.
 */

// MatchDetails interface
interface MatchDetails {
  match_score: number | null;
  match_strength: "strong" | "medium" | "weak" | null;
  match_reasons: string[] | null;
  skills_matched: string[] | null;
  created_at: string | null; // We'll use ISO date strings
  updated_at: string | null;
  last_viewed_by_talent: string | null;
  last_viewed_by_employer: string | null;
  talent_action: "applied" | "saved" | "rejected" | null;
  employer_action: "viewed" | "contacted" | "rejected" | null;
  application_status:
    | "not_applied"
    | "applied"
    | "under_review"
    | "rejected"
    | "accepted"
    | null;
}

/**
 * Adds or updates a MATCH relationship from Job to Talent
 * @param jobId The ID of the Job node
 * @param talentId The ID of the Talent node
 * @param matchDetails Details of the match
 */
export async function addMatchJobToTalent(
  jobId: string,
  talentId: string,
  matchDetails: Partial<MatchDetails>
): Promise<void> {
  const query = `
      MATCH (j:Job {job_id: $jobId})
      MATCH (t:Talent {applicant_id: $talentId})
      MERGE (j)-[m:MATCHES]->(t)
      ON CREATE SET
        m = $matchDetails,
        m.created_at = datetime(),
        m.updated_at = datetime()
      ON MATCH SET
        m += $matchDetails,
        m.updated_at = datetime()
    `;

  const fullMatchDetails: MatchDetails = {
    match_score: null,
    match_strength: null,
    match_reasons: null,
    skills_matched: null,
    created_at: null,
    updated_at: null,
    last_viewed_by_talent: null,
    last_viewed_by_employer: null,
    talent_action: null,
    employer_action: null,
    application_status: null,
    ...matchDetails,
  };

  await write(query, { jobId, talentId, matchDetails: fullMatchDetails });
  console.log(`Match added/updated from Job ${jobId} to Talent ${talentId}`);
}

/**
 * Adds or updates a MATCH relationship from Talent to Job
 * @param talentId The ID of the Talent node
 * @param jobId The ID of the Job node
 * @param matchDetails Details of the match
 */
export async function addMatchTalentToJob(
  talentId: string,
  jobId: string,
  matchDetails: Partial<MatchDetails>
): Promise<void> {
  const query = `
      MATCH (t:Talent {applicant_id: $talentId})
      MATCH (j:Job {job_id: $jobId})
      MERGE (t)-[m:MATCHES]->(j)
      ON CREATE SET
        m = $matchDetails,
        m.created_at = datetime(),
        m.updated_at = datetime()
      ON MATCH SET
        m += $matchDetails,
        m.updated_at = datetime()
    `;

  const fullMatchDetails: MatchDetails = {
    match_score: null,
    match_strength: null,
    match_reasons: null,
    skills_matched: null,
    created_at: null,
    updated_at: null,
    last_viewed_by_talent: null,
    last_viewed_by_employer: null,
    talent_action: null,
    employer_action: null,
    application_status: null,
    ...matchDetails,
  };

  await write(query, { talentId, jobId, matchDetails: fullMatchDetails });
  console.log(`Match added/updated from Talent ${talentId} to Job ${jobId}`);
}

/**
 * Removes a MATCH relationship from Job to Talent
 * @param jobId The ID of the Job node
 * @param talentId The ID of the Talent node
 */
export async function removeMatchJobToTalent(
  jobId: string,
  talentId: string
): Promise<void> {
  const query = `
      MATCH (j:Job {job_id: $jobId})-[m:MATCHES]->(t:Talent {applicant_id: $talentId})
      DELETE m
    `;

  await write(query, { jobId, talentId });
  console.log(`Match removed from Job ${jobId} to Talent ${talentId}`);
}

/**
 * Removes a MATCH relationship from Talent to Job
 * @param talentId The ID of the Talent node
 * @param jobId The ID of the Job node
 */
export async function removeMatchTalentToJob(
  talentId: string,
  jobId: string
): Promise<void> {
  const query = `
      MATCH (t:Talent {applicant_id: $talentId})-[m:MATCHES]->(j:Job {job_id: $jobId})
      DELETE m
    `;

  await write(query, { talentId, jobId });
  console.log(`Match removed from Talent ${talentId} to Job ${jobId}`);
}

/**
 * Updates a MATCH relationship from Job to Talent
 * @param jobId The ID of the Job node
 * @param talentId The ID of the Talent node
 * @param updateDetails Details to update in the match
 */
export async function updateMatchJobToTalent(
  jobId: string,
  talentId: string,
  updateDetails: Partial<MatchDetails>
): Promise<void> {
  const query = `
      MATCH (j:Job {job_id: $jobId})-[m:MATCHES]->(t:Talent {applicant_id: $talentId})
      SET m += $updateDetails, m.updated_at = datetime()
    `;

  await write(query, { jobId, talentId, updateDetails });
  console.log(`Match updated from Job ${jobId} to Talent ${talentId}`);
}

/**
 * Updates a MATCH relationship from Talent to Job
 * @param talentId The ID of the Talent node
 * @param jobId The ID of the Job node
 * @param updateDetails Details to update in the match
 */
export async function updateMatchTalentToJob(
  talentId: string,
  jobId: string,
  updateDetails: Partial<MatchDetails>
): Promise<void> {
  const query = `
      MATCH (t:Talent {applicant_id: $talentId})-[m:MATCHES]->(j:Job {job_id: $jobId})
      SET m += $updateDetails, m.updated_at = datetime()
    `;

  await write(query, { talentId, jobId, updateDetails });
  console.log(`Match updated from Talent ${talentId} to Job ${jobId}`);
}

/**
 * Gets all matches for a job
 * @param jobId The ID of the Job node
 */
export async function getMatchesForJob(jobId: string): Promise<MatchDetails[]> {
  const query = `
      MATCH (j:Job {job_id: $jobId})-[m:MATCHES]->(t:Talent)
      RETURN m {
        match_score: m.match_score,
        match_strength: m.match_strength,
        match_reasons: m.match_reasons,
        skills_matched: m.skills_matched,
        created_at: toString(m.created_at),
        updated_at: toString(m.updated_at),
        last_viewed_by_talent: toString(m.last_viewed_by_talent),
        last_viewed_by_employer: toString(m.last_viewed_by_employer),
        talent_action: m.talent_action,
        employer_action: m.employer_action,
        application_status: m.application_status
      } AS match
    `;

  const result = await read(query, { jobId });
  return result.map((record: RecordShape) => record.match as MatchDetails);
}

/**
 * Gets all matches for a talent
 * @param talentId The ID of the Talent node
 */
export async function getMatchesForTalent(
  talentId: string
): Promise<MatchDetails[]> {
  const query = `
      MATCH (t:Talent {applicant_id: $talentId})-[m:MATCHES]->(j:Job)
      RETURN m {
        match_score: m.match_score,
        match_strength: m.match_strength,
        match_reasons: m.match_reasons,
        skills_matched: m.skills_matched,
        created_at: toString(m.created_at),
        updated_at: toString(m.updated_at),
        last_viewed_by_talent: toString(m.last_viewed_by_talent),
        last_viewed_by_employer: toString(m.last_viewed_by_employer),
        talent_action: m.talent_action,
        employer_action: m.employer_action,
        application_status: m.application_status
      } AS match
    `;

  const result = await read(query, { talentId });
  return result.map((record: RecordShape) => record.match as MatchDetails);
}

/*   // Usage examples

  // Add/Update a match from Job to Talent
  addMatchJobToTalent('job123', 'talent456', {
    match_score: 0.85,
    match_strength: 'strong',
    match_reasons: ['Skill match', 'Experience level'],
    skills_matched: ['JavaScript', 'React']
  }).catch(console.error);
  
  // Add/Update a match from Talent to Job
  addMatchTalentToJob('talent789', 'job101', {
    match_score: 0.75,
    match_strength: 'medium',
    match_reasons: ['Location match', 'Salary range'],
    skills_matched: ['Python', 'Data Analysis']
  }).catch(console.error);
  
  // Remove a match from Job to Talent
  removeMatchJobToTalent('job123', 'talent456').catch(console.error);
  
  // Remove a match from Talent to Job
  removeMatchTalentToJob('talent789', 'job101').catch(console.error);
  
  // Update a match from Job to Talent
  updateMatchJobToTalent('job123', 'talent456', {
    match_score: 0.90,
    match_reasons: ['Skill match', 'Experience level', 'Cultural fit']
  }).catch(console.error);
  
  // Update a match from Talent to Job
  updateMatchTalentToJob('talent789', 'job101', {
    match_score: 0.80,
    skills_matched: ['Python', 'Data Analysis', 'Machine Learning']
  }).catch(console.error);
  
  // Get matches for a job
  getMatchesForJob('job123').then(console.log).catch(console.error);
  
  // Get matches for a talent
  getMatchesForTalent('talent789').then(console.log).catch(console.error); */
