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
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                ...(resumeData.email ? [new TextRun(resumeData.email)] : []),
                ...(resumeData.email &&
                (resumeData.phone || resumeData.location)
                  ? [new TextRun(" | ")]
                  : []),
                ...(resumeData.phone
                  ? [new TextRun(formatPhoneNumber(resumeData.phone))]
                  : []),
                ...((resumeData.email || resumeData.phone) &&
                resumeData.location
                  ? [new TextRun(" | ")]
                  : []),
                ...(resumeData.location
                  ? [new TextRun(formatLocation(resumeData.location))]
                  : []),
              ],
              spacing: { after: 400 },
            }),
            ...(resumeData.intro
              ? [
                  new Paragraph({
                    text: "Professional Overview",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 },
                  }),
                  new Paragraph({
                    text: resumeData.intro,
                    spacing: { after: 400 },
                  }),
                ]
              : []),
            ...(resumeData.work_experience &&
            resumeData.work_experience.length > 0
              ? [
                  new Paragraph({
                    text: "Work Experience",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 },
                  }),
                  ...resumeData.work_experience.flatMap(
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
                ]
              : []),
            ...(resumeData.education && resumeData.education.length > 0
              ? [
                  new Paragraph({
                    text: "Education",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 },
                  }),
                  ...resumeData.education.flatMap((edu: Education) => [
                    new Paragraph({
                      text: edu.degree,
                      heading: HeadingLevel.HEADING_3,
                      spacing: { before: 200, after: 100 },
                    }),
                    new Paragraph({
                      text: [
                        edu.institution,
                        [formatDate(edu.start_date), formatDate(edu.end_date)]
                          .filter(Boolean)
                          .join(" - "),
                      ]
                        .filter(Boolean)
                        .join(", "),
                      spacing: { after: 200 },
                    }),
                  ]),
                ]
              : []),
            ...(resumeData.technical_skills &&
            resumeData.technical_skills.length > 0
              ? [
                  new Paragraph({
                    text: "Skills",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 },
                  }),
                  new Paragraph({
                    children: [
                      new TextRun(resumeData.technical_skills.join(", ")),
                    ],
                    spacing: { after: 200 },
                  }),
                ]
              : []),
            ,
            ...(resumeData.professional_certifications &&
            resumeData.professional_certifications.length > 0 &&
            resumeData.professional_certifications.some(
              (cert: Certification) => cert.name
            )
              ? [
                  new Paragraph({
                    text: "Certifications",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 },
                  }),
                  new Paragraph({
                    children: resumeData.professional_certifications
                      .filter((cert: Certification) => cert.name)
                      .map(
                        (cert: Certification) =>
                          new TextRun({ text: `${cert.name}, `, break: 1 })
                      ),
                    spacing: { after: 200 },
                  }),
                ]
              : []),
            ,
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

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

function formatLocation(location: {
  city?: string;
  state?: string;
  zipcode?: string;
}): string {
  return [location.city, location.state, location.zipcode]
    .filter(Boolean)
    .join(", ");
}
