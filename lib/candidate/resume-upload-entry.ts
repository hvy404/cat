"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function resumeUnconfirmedAddToDatabase(
  uuid: string,
  signature: string,
  fileName: string,
  email: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get timestamp in UTC
  const timestamp = new Date().toUTCString();
  // TODO: add timestamp to the database

  // Add to Supabase
  const { data, error } = await supabase.from("candidates").insert([
    {
      uuid: uuid,
      signature: signature,
      email: email,
      filename: fileName,
    },
  ]);

  if (error) {
    return {
      success: false,
      message: `Failed to upload resume`,
    };
  } else {
    return {
      success: true,
      message: "Resume uploaded successfully.",
    };
  }
}
