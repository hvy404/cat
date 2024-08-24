"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function storeEvaluationResult(applicantId: string, jobId: string, combo: string, score: number) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const evaluationColumn = `evaluation_${combo.toLowerCase()}`;

  try {
    const { data, error } = await supabase
      .from("matching_sys_pairs")
      .update({ [evaluationColumn]: score })
      .match({ candidate_id: applicantId, job_id: jobId });

    if (error) {
      console.error("Error storing evaluation result:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error storing evaluation result:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
