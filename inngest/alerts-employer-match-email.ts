import { inngest } from "@/lib/inngest/client";
import postmarkClient from "@/lib/notification-sender/postmark-client";
import { emailTemplate } from "@/lib/notification-template/employer-new-match";
import { obfuscateUUID } from "@/lib/global/protect-uuid";

export const sendEmailFunction = inngest.createFunction(
  { id: "send-alerts-employer-match-email" },
  { event: "app/send-email-employer-new-match" },
  async ({ event, step }) => {
    const {
      to,
      employerName,
      jobTitle,
      candidateName,
      matchReportUrl: rawMatchReportUrl,
    } = event.data;

    if (
      !to ||
      !employerName ||
      !jobTitle ||
      !candidateName ||
      !rawMatchReportUrl
    ) {
      throw new Error("Missing required data to send email");
    }

    try {
      const baseUrl =
        process.env.NODE_ENV === "production"
          ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
          : "http://localhost:3000";

      const encodedEmail = encodeURIComponent(to);

      const matchReportUrlCode = await obfuscateUUID(rawMatchReportUrl);

      const matchReportUrl = `${baseUrl}/dashboard/recommendation?id=${matchReportUrlCode}`;

      const result = await step.run("Send email", async () => {
        const htmlBody = emailTemplate
          .replace("{{employerName}}", employerName)
          .replace("{{jobTitle}}", jobTitle)
          .replace("{{candidateName}}", candidateName)
          .replace("{{matchReportUrl}}", matchReportUrl)
          .replace(
            "{{unsubscribeUrl}}",
            `${baseUrl}/dashboard/unsubscribe/${encodedEmail}?type=match`
          );

        return await postmarkClient.sendEmail({
          From: "hello@notifications.g2xchange.com",
          To: to,
          Subject: `Exceptional Candidate for ${jobTitle}`,
          TextBody: `Hello ${employerName},\n\nWe've found an exceptional match (${candidateName}) for the ${jobTitle} position. Our advanced matching algorithm has thoroughly analyzed this candidate's profile and found a strong alignment with your job requirements. View the detailed match report here: ${matchReportUrl}`,
          HtmlBody: htmlBody,
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
