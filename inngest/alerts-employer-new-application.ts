import { inngest } from "@/lib/inngest/client";
import postmarkClient from "@/lib/notification-sender/postmark-client";
import { emailTemplate } from "@/lib/notification-template/employer-new-application";
import { getEmployerIdFromJob } from "@/lib/match-system/relationship/record-application-submission";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const sendApplicationReceivedAlert = inngest.createFunction(
  { id: "send-alerts-employer-new-application" },
  { event: "app/send-email-employer-new-application" },
  async ({ event, step }) => {
    const { candidateId, jobId, jobTitle } = event.data;
    const supabase = createClient(cookies());

    if (!jobId || !candidateId) {
      throw new Error("Missing required data to send email");
    }

    try {
      const employerId = await step.run("Get employer ID", async () => {
        return await getEmployerIdFromJob(jobId);
      });

      const employer = await step.run("Get employer data", async () => {
        const { data } = await supabase
          .from("employers")
          .select("contact_email, first_name")
          .eq("employer_id", employerId)
          .single();

        if (!data) {
          throw new Error("Employer not found");
        }
        return data;
      });

      const candidate = await step.run("Get candidate data", async () => {
        const { data } = await supabase
          .from("candidates")
          .select("name, email")
          .eq("identity", candidateId)
          .single();

        if (!data) {
          throw new Error("Candidate not found");
        }
        return data;
      });

      const result = await step.run("Send email", async () => {
        const baseUrl =
          process.env.NODE_ENV === "production"
            ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
            : "http://localhost:3000";

        const jobLink = `${baseUrl}/jobs/${jobId}`;
        const encodedEmail = encodeURIComponent(employer.contact_email);

        const htmlBody = emailTemplate
          .replace("{{employerName}}", employer.first_name)
          .replace("{{jobTitle}}", jobTitle)
          .replace("{{applicationUrl}}", jobLink)
          .replace(
            "{{unsubscribeUrl}}",
            `${baseUrl}/dashboard/unsubscribe/${encodedEmail}?type=app`
          );

        const textBody = `
          Dear ${employer.first_name},
          
          We're pleased to inform you that a new application has been received for the following position:
          
          ${jobTitle}
          
          Candidate Details:
          Email: ${candidate.email}
          
          Key points:
          - You can review the candidate's profile and resume through our platform.
          - Consider reaching out to the candidate if their qualifications match your requirements.
          - Remember to update the application status in our system as you progress.
          
          To view the job details and manage applications, visit: ${jobLink}
          
          Best regards,
          G2X Talent Team
          
          Sent to ${employer.contact_email}. To unsubscribe from these notifications, visit: ${baseUrl}/dashboard/unsubscribe/${encodedEmail}?type=app
        `;

        return await postmarkClient.sendEmail({
          From: "hello@notifications.g2xchange.com",
          To: employer.contact_email,
          Subject: "New Application Received",
          HtmlBody: htmlBody,
          TextBody: textBody,
        });
      });

      return {
        message: "Successfully sent email",
        messageId: result.MessageID,
        sentTo: result.To,
      };
    } catch (error) {
      throw new Error("Error processing application alert: " + error);
    }
  }
);
