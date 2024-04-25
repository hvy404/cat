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

  console.log("Recevied email", email);
  console.log("Recevied signature", signature);

  // Add to Supabase
  const { error } = await supabase.from("candidates").insert([
    {
      uuid: uuid,
      signature: signature,
      email: email,
      filename: fileName,
    },
  ]);

  console.log("added to database", fileName, signature);

  return {
    success: true,
    message: "Resume uploaded successfully.",
  };
}
