"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function syncWriter(generatedJobDescriptionId: string, content: any) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("sow_jd_builder")
    .update({ modified_jd: content })
    .eq("job_description_id", generatedJobDescriptionId);

  if (error) {
    //console.error("Error updating the job description", error);
    return {
      success: false,
    };
  }

  return {
    success: true,
  };
}

export async function restoreWriter(generatedJobDescriptionId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // get 'modified_jd' from sow_jd_builder table in where the row eq. to generatedJobDescriptionId
  const { data, error } = await supabase
    .from("sow_jd_builder")
    .select("modified_jd")
    .eq("job_description_id", generatedJobDescriptionId);

  if (error) {
    //console.error("Error updating the job description", error);
    return {
      success: false,
    };
  }

  return {
    success: true,
    data: data[0].modified_jd,
  };
}
