"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Uploads a company logo to the Supabase storage.
 * Replaces exisiting logo if it already exists.
 *
 * @param formData - The form data containing the file and company ID.
 * @returns An object with the public URL of the uploaded file or an error.
 */
export async function uploadCompanyLogo(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const file = formData.get("file") as File;
  const companyId = formData.get("companyId") as string;
  const filename = `${companyId}_logo.${file.name.split('.').pop()}`;

  const filePath = `companies/${companyId}/${filename}`;

  try {
    const { data, error } = await supabase.storage
      .from("partners")
      .upload(filePath, file, { upsert: true });

    if (error) {
      throw error;
    }

    // Get the public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from("partners")
      .getPublicUrl(filePath);

    return { data: publicUrlData.publicUrl, error: null };
  } catch (error) {
    //console.error("Error uploading company logo to Supabase:", error);
    return { data: null, error };
  }
}