"use server";

import { cookies } from "next/headers";

export async function downloadCandidateResume(candidateId: string) {
  // TODO: better way to identify URL if not on Vercel
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const downloadUrl = `${baseUrl}/api/matched-resume/${candidateId}`;

  return downloadUrl;
}
