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
} from "@/lib/candidate/search/bookmark";
import { remapJobProperties } from "./job-utils";

// Create a type that omits the 'embedding' property
type JobNodeWithoutEmbedding = Omit<JobNode, 'embedding'>;

export async function fetchJobDetails(jobId: string) {
  try {
    const details = await getJobNode(jobId);
    if (!details) {
      throw new Error("Job not found");
    }
    const allRelationships = await getAllJobRelationships(jobId);
    const bookmarkExists = await checkCandidateJobBookmarkExists(
      jobId,
      "candidateId"
    );

    // Remap job properties
    const remappedProperties = await remapJobProperties(
      details.job_type,
      details.location_type,
      details.security_clearance ?? "None"
    );
    

    // Create a new object with remapped properties and responsibilities
    const jobDetails: JobNodeWithoutEmbedding & NodeWithId & { companyId?: string } = {
      ...details,
      job_type: remappedProperties.jobType,
      location_type: remappedProperties.locationType,
      security_clearance: remappedProperties.securityClearance,
      responsibilities: details.responsibilities || [],
    };

    // Only include companyId if private_employer is false
    if (!details.private_employer) {
      jobDetails.companyId = details.companyId;
    } else {
      //console.log("Private employer, company information not disclosed");
    }

    // Filter out POSTED_BY relationship if private_employer is true
    const relationships = Object.entries(allRelationships).reduce((acc, [key, value]) => {
      if (!(details.private_employer && key === "POSTED_BY")) {
        acc[key as keyof typeof allRelationships] = value;
      }
      return acc;
    }, {} as typeof allRelationships);

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