import { JobDescription } from "./generate-jd-embeddings";

export function generateHumanReadableJobDescription(
  jobDescription: JobDescription
): string {
  let formattedText = "";

  // Job Title and Company
  formattedText += `**Job Title:** ${jobDescription.jobTitle}\n`;

  // Location and Job Type
  formattedText += `**Location:** ${jobDescription.locationType}\n`;
  if (jobDescription.location) {
    formattedText += `**Specific Locations:**\n`;
    jobDescription.location.forEach((loc) => {
      formattedText += `  - ${loc.city}, ${loc.state}, ${loc.zipcode}\n`;
    });
  }
  formattedText += `**Job Type:** ${jobDescription.jobType}\n\n`;

  // Description and Company Overview
  formattedText += `**Description:**\n${jobDescription.summary}\n\n`;

  // Salary and Compensation
  formattedText += `**Compensation Type:** ${jobDescription.compensationType}\n`;

  if (jobDescription.compensationType === "hourly") {
    formattedText += `This position offers an hourly wage ranging from $${jobDescription.hourlyCompMin} to $${jobDescription.hourlyCompMax}.\n\n`;
  } else if (jobDescription.compensationType === "salary") {
    formattedText += `This position offers a salary ranging from $${jobDescription.minSalary} to $${jobDescription.maxSalary}.\n\n`;
  } else if (jobDescription.compensationType === "commission") {
    formattedText += `This position offers an On-Target Earnings (OTE) salary of $${
      jobDescription.oteSalary
    }, with a commission rate of ${
      jobDescription.commissionPercent
    }%. Commission pay: ${jobDescription.commissionPay ? "Yes" : "No"}.\n\n`;
  }

  // Responsibilities
  if (jobDescription.responsibilities) {
    formattedText += `**Responsibilities:**\n`;
    jobDescription.responsibilities.forEach((responsibility) => {
      formattedText += `  - ${responsibility}\n`;
    });
    formattedText += "\n";
  }

  // Qualifications
  if (jobDescription.qualifications) {
    formattedText += `**Qualifications:**\n`;
    jobDescription.qualifications.forEach((qualification) => {
      formattedText += `  - ${qualification}\n`;
    });
    formattedText += "\n";
  }

  // Preferred Skills
  if (jobDescription.preferredSkills) {
    formattedText += `**Desired Skills:**\n`;
    jobDescription.preferredSkills.forEach((skill) => {
      formattedText += `  - ${skill}\n`;
    });
    formattedText += "\n";
  }

  // Skills
  if (jobDescription.skills) {
    formattedText += `**Core Skills:**\n`;
    jobDescription.skills.forEach((skill) => {
      formattedText += `  - ${skill}\n`;
    });
    formattedText += "\n";
  }

  // Benefits
  if (jobDescription.benefits) {
    formattedText += `**Benefits:**\n`;
    jobDescription.benefits.forEach((benefit) => {
      formattedText += `  - ${benefit}\n`;
    });
    formattedText += "\n";
  }

  // Other fields
  if (jobDescription.experience) {
    formattedText += `**Experience:** Candidates should have ${jobDescription.experience} of relevant experience.\n\n`;
  }
  if (jobDescription.clearanceLevel) {
    formattedText += `**Clearance Level:** This position requires ${jobDescription.clearanceLevel} clearance.\n\n`;
  }

  if (jobDescription.remoteFlexibility !== undefined) {
    formattedText += `**Remote Flexibility:** ${
      jobDescription.remoteFlexibility
        ? "This role offers remote work flexibility."
        : "This role does not offer remote work flexibility."
    }\n\n`;
  }
  if (jobDescription.leadershipOpportunity !== undefined) {
    formattedText += `**Leadership Opportunity:** ${
      jobDescription.leadershipOpportunity
        ? "This position offers leadership opportunities."
        : "This position does not offer leadership opportunities."
    }\n\n`;
  }
  if (jobDescription.suitablePastRoles) {
    formattedText += `**Candidates with previous experience as a:**\n`;
    jobDescription.suitablePastRoles.forEach((role) => {
      formattedText += `  - ${role}\n`;
    });
    formattedText += "\n";
  }

  // New section for Similar Job Titles
  if (jobDescription.similarJobTitle) {
    formattedText += `**Jobseekers looking for the following roles should apply:**\n`;
    jobDescription.similarJobTitle.forEach((title) => {
      formattedText += `  - ${title}\n`;
    });
    formattedText += "\n";
  }

  return formattedText;
}