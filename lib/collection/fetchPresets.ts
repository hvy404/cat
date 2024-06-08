"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function fetchPresets(owner: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: intro, error: introError } = await supabase
    .from("collections")
    .select("title, primary, snippet_id")
    .eq("type", "intro")
    .eq("owner", owner);

  if (introError) {
    throw new Error(introError.message);
  }

  const { data: benefits, error: benefitError } = await supabase
    .from("collections")
    .select("title, primary, snippet_id")
    .eq("type", "benefits")
    .eq("owner", owner);

  if (benefitError) {
    throw new Error(benefitError.message);
  }

  return {
    intro,
    benefits,
  };
}

export async function updatePrimaryPreset(owner: string, type: "intro" | "benefits", snippet_id: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
  
    // Reset all to false
    const { error: resetError } = await supabase
      .from("collections")
      .update({ primary: false })
      .eq("type", type)
      .eq("owner", owner);
  
    if (resetError) {
      throw new Error(resetError.message);
    }
  
    // Set selected to true
    const { error: updateError } = await supabase
      .from("collections")
      .update({ primary: true })
      .eq("snippet_id", snippet_id)
      .eq("owner", owner);
  
    if (updateError) {
      throw new Error(updateError.message);
    }
  }