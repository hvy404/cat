"use server";

import {
  getJobNode,
  getAllJobRelationships,
  JobNode,
  NodeWithId,
} from "@/lib/jobs/mutation";
import {
  addCandidateJobBookmark,
  removeCandidateJobBookmark,
  checkCandidateJobBookmarkExists,
} from "./bookmark";
import { remapJobProperties } from "./job-utils";

// Create a type that omits the 'embedding' property
type JobNodeWithoutEmbedding = Omit<JobNode, 'embedding'>;

export async function fetchJobDetails(jobId: string) {
  try {
    const details = await getJobNode(jobId);
    if (!details) {
      throw new Error("Job not found");
    }
    const relationships = await getAllJobRelationships(jobId);
    const bookmarkExists = await checkCandidateJobBookmarkExists(
      jobId,
      "candidateId"
    );

    // Remap job properties
    const remappedProperties = await remapJobProperties(
      details.job_type,
      details.location_type,
      details.security_clearance
    );

    // Create a new object with remapped properties
    const jobDetails: JobNodeWithoutEmbedding & NodeWithId = {
      ...details,
      job_type: remappedProperties.jobType,
      location_type: remappedProperties.locationType,
      security_clearance: remappedProperties.securityClearance,
    };

    return {
      jobDetails,
      jobRelationships: relationships,
      isBookmarked: bookmarkExists,
    };
  } catch (error) {
    console.error("Error fetching job details:", error);
    throw new Error("Failed to fetch job details. Please try again later.");
  }
}

export async function toggleBookmark(
  jobId: string,
  isCurrentlyBookmarked: boolean
) {
  try {
    if (isCurrentlyBookmarked) {
      await removeCandidateJobBookmark(jobId, "candidateId");
    } else {
      await addCandidateJobBookmark(jobId, "candidateId");
    }
    return !isCurrentlyBookmarked;
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    throw new Error("Failed to toggle bookmark. Please try again later.");
  }
}