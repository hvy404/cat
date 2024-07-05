"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const cookiesStore = cookies();
const supabase = createClient(cookiesStore);

interface EmployerDetails {
  employerId: string;
}

export async function CheckUserCompany({ employerId }: EmployerDetails) {
  // check supabase table "company_employers" if employerId exists. employerId is the "employer_uuid" column in the table
  // if exists, return true, else return false

  const { data, error } = await supabase
    .from("company_employers")
    .select("employer_uuid")
    .eq("employer_uuid", employerId);

  if (error) {
    console.error(error);
    return false;
  }

  if (data) {
    return false; //setting to false temporarily to test the function
  }
}
