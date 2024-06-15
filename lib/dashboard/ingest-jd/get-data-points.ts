"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";


export async function AddJDGetDataPoints(jdUUID: string, employer: string) {
  noStore();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch values from Supabase
  const { data, error } = await supabase
    .from("job_postings")
    .select(
      "title, location, location_type, min_salary, max_salary, security_clearance, salary_disclose, commission_pay, commission_percent, private_employer, ote_salary, compensation_type, hourly_comp_min, hourly_comp_max"
    )
    .eq("jd_uuid", jdUUID);

    //console.log(data);

  if (error) {
    console.error("Error fetching data: ", error);
    return;
  }

  return { jd_data: data };
}
