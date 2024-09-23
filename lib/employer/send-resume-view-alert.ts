"use server";
import { inngest } from "@/lib/inngest/client";

/**
 * Sends an email alert to a candidate when their resume is viewed for a job.
 *
 * @param props - An object containing the following properties:
 * @param props.candidateName - The name of the candidate.
 * @param props.jobId - The ID of the job.
 * @param props.candidateEmail - The email address of the candidate.
 * @param props.jobTitle - The title of the job.
 * @returns An object with `success` and `message` properties indicating whether the alert was sent successfully.
 */
export async function sendResumeViewAlertAction(props: {
  candidateName: string;
  jobId: string;
  candidateEmail: string;
  jobTitle: string;
}) {
  //console.log("Candidate Name:", props.candidateName);
  //console.log("Job ID:", props.jobId);
  //console.log("Candidate Email:", props.candidateEmail);
  //console.log("Job Title:", props.jobTitle);

  try {
    await inngest.send({
      name: "app/send-email-candidate-resume-view",
      data: {
        candidateName: props.candidateName,
        jobId: props.jobId,
        candidateEmail: props.candidateEmail,
        jobTitle: props.jobTitle,
      },
    });

    return { success: true, message: "Resume view alert sent successfully" };
  } catch (error) {
    console.error("Error sending resume view alert:", error);
    return { success: false, message: "Failed to send resume view alert" };
  }
}
