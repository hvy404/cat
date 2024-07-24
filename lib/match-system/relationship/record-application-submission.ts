"use server";

import { v4 as uuidv4 } from 'uuid';
import * as supabaseMutation from "@/lib/match-system/relationship/mutation-sql";
import * as neo4jMutation from "@/lib/match-system/relationship/mutation-graph";
import { cookies } from "next/headers";
import { createClient } from '@/lib/supabase/server';

async function AtomicRecordApplicationSubmission(
  candidateId: string,
  jobId: string,
  resumeId: string
) {
  const applicationId = uuidv4();
  const alertId = uuidv4();

  const applicationData = {
    id: applicationId,
    candidate_id: candidateId,
    job_id: jobId,
    resume_id: resumeId,
    status: 'submitted' as const
  };

  try {
    // Step 1: Create application in Supabase
    const supabaseApplication = await supabaseMutation.createApplication(applicationData);
    if (!supabaseApplication) {
      throw new Error("Failed to create application in Supabase");
    }

    // Step 2: Create application in Neo4j
    const neo4jApplication = await neo4jMutation.createApplication(applicationData);
    if (!neo4jApplication) {
      // Rollback Supabase creation
      await supabaseMutation.deleteApplication(applicationId);
      throw new Error("Failed to create application in Neo4j");
    }

    // Get employer ID (you need to implement this function)
    const employerId = await getEmployerIdFromJob(jobId);

    const alertData = {
      id: alertId,
      user_id: employerId,
      type: 'application' as const,
      reference_id: applicationId,
      status: 'unread' as const
    };

    // Step 3: Create alert in Supabase
    const supabaseAlert = await supabaseMutation.createAlert(alertData);
    if (!supabaseAlert) {
      // Rollback previous creations
      await supabaseMutation.deleteApplication(applicationId);
      await neo4jMutation.deleteApplication(applicationId);
      throw new Error("Failed to create alert in Supabase");
    }

    // Step 4: Create alert in Neo4j
    const neo4jAlert = await neo4jMutation.createAlert(alertData);
    if (!neo4jAlert) {
      // Rollback all previous creations
      await supabaseMutation.deleteApplication(applicationId);
      await neo4jMutation.deleteApplication(applicationId);
      await supabaseMutation.deleteAlert(alertId);
      throw new Error("Failed to create alert in Neo4j");
    }

    return { success: true, applicationId };
  } catch (error) {
    console.error("Error in AtomicRecordApplicationSubmission:", error);
    return { success: false, error: (error as Error).message };
  }
}

export default AtomicRecordApplicationSubmission;

// Helper function to get the employer ID from a job
async function getEmployerIdFromJob(jobId: string): Promise<string> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
  
    const { data, error } = await supabase
      .from('job_postings')
      .select('employer_id')
      .eq('jd_id', jobId)
      .single();
  
    if (error) {
      console.error('Error fetching employer ID:', error);
      throw new Error('Failed to fetch employer ID');
    }
  
    if (!data || !data.employer_id) {
      throw new Error('Employer ID not found for the given job');
    }
  
    return data.employer_id;
  }