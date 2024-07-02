// TODO: NanoID generation should be at the onboard profile confirm stage
// And maybe this should be stored in user metadata

"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { customAlphabet } from "nanoid";

export async function fetchCatalystId(candidateId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  // Define a custom alphabet for nanoid (uppercase letters and numbers only)
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nanoid = customAlphabet(alphabet, 6);

  try {
    // Fetch the quickid for the given candidateId
    const { data, error } = await supabase
      .from("candidate_quickids")
      .select("quickid")
      .eq("candidate_id", candidateId);

    if (error) {
      console.error(error);
      return null;
    }

    // Check if a quickid was found
    if (!data[0]) {
      console.log("No quickid found");
      
      // Generate a new quickid using custom nanoid (6 characters, letters and numbers only, uppercase)
      const newQuickId = nanoid();
      
      try {
        // Save the new quickid to the database
        const { error: insertError } = await supabase
          .from("candidate_quickids")
          .insert({ candidate_id: candidateId, quickid: newQuickId });
        
        if (insertError) {
          console.error("Error inserting new quickid:", insertError);
          return null;
        }
        
        // Return the newly generated and saved quickid
        return newQuickId;
      } catch (insertCatchError) {
        console.error("Error in quickid insertion:", insertCatchError);
        return null;
      }
    }

    // If a quickid was found, return it
    return data[0].quickid;
  } catch (error) {
    console.error("Error in fetchCatalystId:", error);
    return null;
  }
}