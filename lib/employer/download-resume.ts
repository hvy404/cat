"use server";

export async function downloadCandidateResume(candidateId: string) {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000";
  const downloadUrl = `${baseUrl}/api/matched-resume/${candidateId}`;

  return downloadUrl;
}
