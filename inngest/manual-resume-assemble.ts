import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { v4 as uuidv4 } from "uuid";
import { createId } from "@paralleldrive/cuid2";

interface WorkExperience {
  job_title: string;
  organization: string;
  start_date: string;
  end_date: string;
  responsibilities: string;
}

interface Education {
  degree: string;
  institution: string;
  start_date: string;
  end_date: string;
}

interface Certification {
  name: string;
}

export const resumeManualAssembly = inngest.createFunction(
  { id: "resume-manual-assembly" },
  { event: "app/resume-manual-assembly" },
  async ({ event, step }) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const candidateId = event.data.user.id;

    const { data, error } = await step.run(
      "Fetch Modified Static Data",
      async () => {
        return supabase
          .from("candidate_create")
          .select("modified_static")
          .eq("user", candidateId)
          .single();
      }
    );

    if (error || !data || !data.modified_static) {
      throw new Error("Error fetching or no modified static data found");
    }

    const resumeData = data.modified_static;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: resumeData.name || "",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 400 },
            }),
            new Paragraph({
              text: `Email: ${resumeData.email || ""}`,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: `Phone: ${resumeData.phone || ""}`,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: `Location: ${resumeData.location?.city || ""}, ${
                resumeData.location?.state || ""
              } ${resumeData.location?.zipcode || ""}`,
              spacing: { after: 400 },
            }),
            new Paragraph({
              text: "Professional Summary",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              text: resumeData.intro || "",
              spacing: { after: 400 },
            }),
            new Paragraph({
              text: "Work Experience",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),
            ...(resumeData.work_experience || []).flatMap(
              (job: WorkExperience) => [
                new Paragraph({
                  text: `${job.job_title} at ${job.organization}`,
                  heading: HeadingLevel.HEADING_3,
                  spacing: { before: 200, after: 100 },
                }),
                new Paragraph({
                  text: `${formatDate(job.start_date)} - ${formatDate(
                    job.end_date
                  )}`,
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  text: job.responsibilities,
                  spacing: { after: 200 },
                }),
              ]
            ),
            new Paragraph({
              text: "Education",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),
            ...(resumeData.education || []).flatMap((edu: Education) => [
              new Paragraph({
                text: edu.degree,
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 200, after: 100 },
              }),
              new Paragraph({
                text: `${edu.institution}, ${formatDate(
                  edu.start_date
                )} - ${formatDate(edu.end_date)}`,
                spacing: { after: 200 },
              }),
            ]),
            new Paragraph({
              text: "Skills",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              children: (resumeData.technical_skills || []).map(
                (skill: string) => new TextRun({ text: `${skill}, `, break: 1 })
              ),
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: "Certifications",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              children: (resumeData.professional_certifications || []).map(
                (cert: Certification) =>
                  new TextRun({ text: `${cert.name}, `, break: 1 })
              ),
              spacing: { after: 200 },
            }),
          ],
        },
      ],
    });

    const docxBuffer = await Packer.toBuffer(doc);

    const filename = `${uuidv4()}.docx`;
    const filePath = `nautilus/${candidateId}/${filename}`;

    await step.run("Upload DOCX to Supabase", async () => {
      const { error } = await supabase.storage
        .from("resumes")
        .upload(filePath, docxBuffer, {
          contentType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
      if (error) throw error;
    });

    const address = createId();

    /* Save entry to database */
    try {
      const { data, error } = await supabase
        .from("candidate_resume")
        .insert([
          {
            candidate_identity: candidateId,
            path: filePath,
            address: address,
            resume_name: "My Uploaded Resume",
            default: true,
          },
        ])
        .select();

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error adding resume entry:", error);
      throw error;
    }

    return {
      message: "Successfully assembled and uploaded resume",
      filePath: filePath,
      filename: filename,
    };
  }
);

function formatDate(dateString: string): string {
  if (!dateString) return "";
  if (dateString.toLowerCase() === "present") return "Present";

  const [year, month] = dateString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
}
