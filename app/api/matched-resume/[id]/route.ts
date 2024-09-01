import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Retrieves the default resume for the specified candidate and downloads it as an attachment.
 *
 * @param request - The Next.js request object.
 * @param params - The route parameters, containing the `id` of the candidate.
 * @returns A Next.js response with the downloaded resume file.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const candidateId = params.id;

  const supabase = createClient(cookies());

  const { data: resumeData, error: resumeError } = await supabase
    .from("candidate_resume")
    .select("path")
    .eq("candidate_identity", candidateId)
    .eq("default", true)
    .single();

  if (!resumeData || resumeError) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { data, error } = await supabase.storage
    .from("resumes")
    .download(resumeData.path);

  if (error) {
    return NextResponse.json(
      { error: "Failed to download resume" },
      { status: 500 }
    );
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/octet-stream");
  headers.set(
    "Content-Disposition",
    `attachment; filename="${resumeData.path.split("/").pop()}"`
  );

  return new NextResponse(data, {
    status: 200,
    headers,
  });
}
