import { inngest } from "@/lib/inngest/client";
import postmarkClient from "@/lib/notification-sender/postmark-client";
import { emailTemplate } from "@/lib/notification-template/candidate-resume-viewed";

export const sendResumeViewAlert = inngest.createFunction(
  { id: "send-alerts-candidate-resume-view" },
  { event: "app/send-email-candidate-resume-view" },
  async ({ event, step }) => {
    const { candidateName, jobId, candidateEmail, jobTitle } = event.data;

    if (!candidateName || !jobId || !candidateEmail || !jobTitle) {
      throw new Error("Missing required data to send email");
    }

    try {
      const result = await step.run("Send email", async () => {
      

        const baseUrl =
        process.env.NODE_ENV === "production"
          ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
          : "http://localhost:3000";

          const jobLink = `${baseUrl}/jobs/${jobId}`;

      const encodedEmail = encodeURIComponent(candidateEmail);

        const htmlBody = emailTemplate
          .replace("[Candidate Name]", candidateName)
          .replace("[Job Name]", jobTitle)
          .replace("[Job Link]", jobLink)
          .replace("[Unsubscribe Link]", `${baseUrl}/dashboard/unsub/${encodedEmail}?type=resume`);

        const textBody = `
Dear ${candidateName},

We're pleased to inform you that an employer has reviewed your resume for the following position:

${jobTitle}

This indicates that our platform has identified you as a potential match for this role, and the employer has expressed interest in your profile.

Key points:
- No immediate action is required on your part.
- The employer may contact you directly if they wish to proceed.
- You're welcome to apply for the position if interested.

To view the job details, visit: ${jobLink}

If you have any questions, please contact our support team.

Best regards,
G2X Talent Team

Sent to ${candidateEmail}. Manage your notification preferences in your account settings.
`;

        return await postmarkClient.sendEmail({
          From: "hello@notifications.g2xchange.com",
          To: candidateEmail,
          Subject: "Your Resume Has Been Viewed",
          HtmlBody: htmlBody,
          TextBody: textBody,
        });
      });

      return {
        message: "Successfully sent email",
        messageId: result.MessageID,
      };
    } catch (error) {
      throw new Error("Error sending email: " + error);
    }
  }
);
