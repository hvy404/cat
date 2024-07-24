"use server";
import { write, read } from "@/lib/neo4j/utils";
import { Integer, RecordShape } from "neo4j-driver";

// Interfaces
export interface MatchNode {
  id: string;
  job_id: string;
  candidate_id: string;
  score: number;
  created_at: string;
}

export interface InviteNode {
  id: string;
  employer_id: string;
  candidate_id: string;
  job_id: string;
  status: 'sent' | 'viewed' | 'accepted' | 'declined';
  created_at: string;
}

export interface ApplicationNode {
  id: string;
  candidate_id: string;
  job_id: string;
  resume_id: string; // New field
  status: 'submitted' | 'reviewed' | 'interview' | 'rejected' | 'accepted';
  created_at: string;
}

export interface AlertNode {
  id: string;
  user_id: string;
  type: 'match' | 'invite' | 'application';
  reference_id: string;
  status: 'unread' | 'read';
  created_at: string;
}

interface NodeWithId {
  labels: string[];
  _id: number;
}

// Helper function to convert Neo4j record to node with ID
function recordToNodeWithId<T>(record: RecordShape, nodeKey: string): T & NodeWithId {
  const node = record[nodeKey];
  const nodeId = record.nodeId;
  return {
    ...node.properties,
    labels: node.labels,
    _id: nodeId instanceof Integer ? nodeId.toNumber() : nodeId,
  };
}

// Match CRUD operations
export async function createMatch(matchData: Omit<MatchNode, 'created_at'>): Promise<(MatchNode & NodeWithId) | null> {
  const query = `
    CREATE (m:Match $matchData)
    SET m.created_at = datetime()
    RETURN m, ID(m) as nodeId
  `;

  try {
    const result = await write(query, { matchData });
    return result.length > 0 ? recordToNodeWithId<MatchNode>(result[0], 'm') : null;
  } catch (error) {
    console.error("Error creating Match node:", error);
    throw error;
  }
}

export async function getMatch(matchId: string): Promise<(MatchNode & NodeWithId) | null> {
  const query = `
    MATCH (m:Match {id: $matchId})
    RETURN m, ID(m) as nodeId
  `;

  try {
    const result = await read(query, { matchId });
    return result.length > 0 ? recordToNodeWithId<MatchNode>(result[0], 'm') : null;
  } catch (error) {
    console.error("Error retrieving Match node:", error);
    throw error;
  }
}

export async function updateMatch(matchId: string, updateData: Partial<MatchNode>): Promise<boolean> {
  const query = `
    MATCH (m:Match {id: $matchId})
    SET m += $updateData
    RETURN m
  `;

  try {
    const result = await write(query, { matchId, updateData });
    return result.length > 0;
  } catch (error) {
    console.error("Error updating Match node:", error);
    throw error;
  }
}

export async function deleteMatch(matchId: string): Promise<boolean> {
  const query = `
    MATCH (m:Match {id: $matchId})
    DETACH DELETE m
    RETURN count(m) AS deletedCount
  `;

  try {
    const result = await write(query, { matchId });
    return result[0].deletedCount > 0;
  } catch (error) {
    console.error("Error deleting Match node:", error);
    throw error;
  }
}

// Invite CRUD operations
export async function createInvite(inviteData: Omit<InviteNode, 'created_at'>): Promise<(InviteNode & NodeWithId) | null> {
  const query = `
    CREATE (i:Invite $inviteData)
    SET i.created_at = datetime()
    RETURN i, ID(i) as nodeId
  `;

  try {
    const result = await write(query, { inviteData });
    return result.length > 0 ? recordToNodeWithId<InviteNode>(result[0], 'i') : null;
  } catch (error) {
    console.error("Error creating Invite node:", error);
    throw error;
  }
}

export async function getInvite(inviteId: string): Promise<(InviteNode & NodeWithId) | null> {
  const query = `
    MATCH (i:Invite {id: $inviteId})
    RETURN i, ID(i) as nodeId
  `;

  try {
    const result = await read(query, { inviteId });
    return result.length > 0 ? recordToNodeWithId<InviteNode>(result[0], 'i') : null;
  } catch (error) {
    console.error("Error retrieving Invite node:", error);
    throw error;
  }
}

export async function updateInvite(inviteId: string, updateData: Partial<InviteNode>): Promise<boolean> {
  const query = `
    MATCH (i:Invite {id: $inviteId})
    SET i += $updateData
    RETURN i
  `;

  try {
    const result = await write(query, { inviteId, updateData });
    return result.length > 0;
  } catch (error) {
    console.error("Error updating Invite node:", error);
    throw error;
  }
}

export async function deleteInvite(inviteId: string): Promise<boolean> {
  const query = `
    MATCH (i:Invite {id: $inviteId})
    DETACH DELETE i
    RETURN count(i) AS deletedCount
  `;

  try {
    const result = await write(query, { inviteId });
    return result[0].deletedCount > 0;
  } catch (error) {
    console.error("Error deleting Invite node:", error);
    throw error;
  }
}

// Application CRUD operations
export async function createApplication(applicationData: Omit<ApplicationNode, 'created_at'>): Promise<(ApplicationNode & NodeWithId) | null> {
  const query = `
    MATCH (t:Talent {applicant_id: $candidate_id})
    MATCH (j:Job {job_id: $job_id})
    CREATE (a:Application $applicationData)
    CREATE (t)-[:SUBMITTED]->(a)
    CREATE (a)-[:FOR]->(j)
    SET a.created_at = datetime()
    RETURN a, ID(a) as nodeId
  `;

  try {
    const result = await write(query, { 
      applicationData,
      candidate_id: applicationData.candidate_id,
      job_id: applicationData.job_id
    });
    return result.length > 0 ? recordToNodeWithId<ApplicationNode>(result[0], 'a') : null;
  } catch (error) {
    console.error("Error creating Application node with relationships:", error);
    throw error;
  }
}


export async function getApplication(applicationId: string): Promise<(ApplicationNode & NodeWithId) | null> {
  const query = `
    MATCH (a:Application {id: $applicationId})
    RETURN a, ID(a) as nodeId
  `;

  try {
    const result = await read(query, { applicationId });
    return result.length > 0 ? recordToNodeWithId<ApplicationNode>(result[0], 'a') : null;
  } catch (error) {
    console.error("Error retrieving Application node:", error);
    throw error;
  }
}

export async function updateApplication(applicationId: string, updateData: Partial<ApplicationNode>): Promise<boolean> {
  const query = `
    MATCH (a:Application {id: $applicationId})
    SET a += $updateData
    RETURN a
  `;

  try {
    const result = await write(query, { applicationId, updateData });
    return result.length > 0;
  } catch (error) {
    console.error("Error updating Application node:", error);
    throw error;
  }
}

export async function deleteApplication(applicationId: string): Promise<boolean> {
  const query = `
    MATCH (a:Application {id: $applicationId})
    DETACH DELETE a
    RETURN count(a) AS deletedCount
  `;

  try {
    const result = await write(query, { applicationId });
    return result[0].deletedCount > 0;
  } catch (error) {
    console.error("Error deleting Application node:", error);
    throw error;
  }
}

// Alert CRUD operations
export async function createAlert(alertData: Omit<AlertNode, 'created_at'>): Promise<(AlertNode & NodeWithId) | null> {
  const query = `
    CREATE (a:Alert $alertData)
    SET a.created_at = datetime()
    RETURN a, ID(a) as nodeId
  `;

  try {
    const result = await write(query, { alertData });
    return result.length > 0 ? recordToNodeWithId<AlertNode>(result[0], 'a') : null;
  } catch (error) {
    console.error("Error creating Alert node:", error);
    throw error;
  }
}

export async function getAlert(alertId: string): Promise<(AlertNode & NodeWithId) | null> {
  const query = `
    MATCH (a:Alert {id: $alertId})
    RETURN a, ID(a) as nodeId
  `;

  try {
    const result = await read(query, { alertId });
    return result.length > 0 ? recordToNodeWithId<AlertNode>(result[0], 'a') : null;
  } catch (error) {
    console.error("Error retrieving Alert node:", error);
    throw error;
  }
}

export async function updateAlert(alertId: string, updateData: Partial<AlertNode>): Promise<boolean> {
  const query = `
    MATCH (a:Alert {id: $alertId})
    SET a += $updateData
    RETURN a
  `;

  try {
    const result = await write(query, { alertId, updateData });
    return result.length > 0;
  } catch (error) {
    console.error("Error updating Alert node:", error);
    throw error;
  }
}

export async function deleteAlert(alertId: string): Promise<boolean> {
  const query = `
    MATCH (a:Alert {id: $alertId})
    DETACH DELETE a
    RETURN count(a) AS deletedCount
  `;

  try {
    const result = await write(query, { alertId });
    return result[0].deletedCount > 0;
  } catch (error) {
    console.error("Error deleting Alert node:", error);
    throw error;
  }
}

// Utility functions

export async function getMatchesByJob(jobId: string): Promise<(MatchNode & NodeWithId)[]> {
  const query = `
    MATCH (m:Match {job_id: $jobId})
    RETURN m, ID(m) as nodeId
  `;

  try {
    const result = await read(query, { jobId });
    return result.map((record: RecordShape) => recordToNodeWithId<MatchNode>(record, 'm'));
  } catch (error) {
    console.error("Error retrieving Matches by Job:", error);
    throw error;
  }
}

export async function getMatchesByCandidate(candidateId: string): Promise<(MatchNode & NodeWithId)[]> {
  const query = `
    MATCH (m:Match {candidate_id: $candidateId})
    RETURN m, ID(m) as nodeId
  `;

  try {
    const result = await read(query, { candidateId });
    return result.map((record: RecordShape) => recordToNodeWithId<MatchNode>(record, 'm'));
  } catch (error) {
    console.error("Error retrieving Matches by Candidate:", error);
    throw error;
  }
}

export async function getInvitesByEmployer(employerId: string): Promise<(InviteNode & NodeWithId)[]> {
  const query = `
    MATCH (i:Invite {employer_id: $employerId})
    RETURN i, ID(i) as nodeId
  `;

  try {
    const result = await read(query, { employerId });
    return result.map((record: RecordShape) => recordToNodeWithId<InviteNode>(record, 'i'));
  } catch (error) {
    console.error("Error retrieving Invites by Employer:", error);
    throw error;
  }
}

export async function getInvitesByCandidate(candidateId: string): Promise<(InviteNode & NodeWithId)[]> {
  const query = `
    MATCH (i:Invite {candidate_id: $candidateId})
    RETURN i, ID(i) as nodeId
  `;

  try {
    const result = await read(query, { candidateId });
    return result.map((record: RecordShape) => recordToNodeWithId<InviteNode>(record, 'i'));
  } catch (error) {
    console.error("Error retrieving Invites by Candidate:", error);
    throw error;
  }
}

export async function getApplicationsByJob(jobId: string): Promise<(ApplicationNode & NodeWithId)[]> {
  const query = `
    MATCH (a:Application {job_id: $jobId})
    RETURN a, ID(a) as nodeId
  `;

  try {
    const result = await read(query, { jobId });
    return result.map((record: RecordShape) => recordToNodeWithId<ApplicationNode>(record, 'a'));
  } catch (error) {
    console.error("Error retrieving Applications by Job:", error);
    throw error;
  }
}

export async function getApplicationsByCandidate(candidateId: string): Promise<(ApplicationNode & NodeWithId)[]> {
  const query = `
    MATCH (a:Application {candidate_id: $candidateId})
    RETURN a, ID(a) as nodeId
  `;

  try {
    const result = await read(query, { candidateId });
    return result.map((record: RecordShape) => recordToNodeWithId<ApplicationNode>(record, 'a'));
  } catch (error) {
    console.error("Error retrieving Applications by Candidate:", error);
    throw error;
  }
}

export async function getAlertsByUser(userId: string): Promise<(AlertNode & NodeWithId)[]> {
  const query = `
    MATCH (a:Alert {user_id: $userId})
    RETURN a, ID(a) as nodeId
  `;

  try {
    const result = await read(query, { userId });
    return result.map((record: RecordShape) => recordToNodeWithId<AlertNode>(record, 'a'));
  } catch (error) {
    console.error("Error retrieving Alerts by User:", error);
    throw error;
  }
}