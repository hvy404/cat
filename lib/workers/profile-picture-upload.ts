"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

interface UploadResult {
  success: boolean;
  message: string;
  publicURL?: string;
}

export async function uploadProfilePicture(
  formData: FormData
): Promise<UploadResult> {
  const file = formData.get("file") as File | null;
  const userId = formData.get("userId") as string | null;

  if (!file || !userId) {
    return { success: false, message: "No file or userId provided." };
  }

  const fileExtension = file.name.split(".").pop();
  const newFileName = `${uuidv4()}.${fileExtension}`;

  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(`public/${newFileName}`, file, {
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(`public/${newFileName}`);

    // PublicUrl will https://jiccshhthuhmcudiyljl.supabase.co/storage/v1/object/public/avatars/public/a18d5cff-73a4-4307-a748-1104380675b5.png

    const { error: updateError } = await supabase
      .from("avatars")
      .upsert(
        { identity: userId, address: newFileName },
        { onConflict: "identity" }
      );

    if (error) throw error;

    if (updateError) {
      throw updateError;
    }

    return {
      success: true,
      message: "Profile picture uploaded successfully.",
      publicURL: urlData.publicUrl,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { success: false, message: "Error uploading file." };
  }
}
