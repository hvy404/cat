"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const cookiesStore = cookies();
const supabase = createClient(cookiesStore);

interface EmployerDetails {
  employerId: string;
}

interface CompanyEmployerRecord {
  employer_uuid: string;
  company_id: string;
}

/**
 * Checks if a user is associated with a company.
 * @param {EmployerDetails} employerId - The employer ID of the user.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the user is associated with a company.
 */
export async function checkUserCompany({
  employerId,
}: EmployerDetails): Promise<boolean> {
  const { data, error } = await supabase
    .from("company_employers")
    .select("employer_uuid, company_id")
    .eq("employer_uuid", employerId)
    .not("company_id", "is", null);

  if (error) {
    console.error("Error checking user company:", error);
    return false;
  }

  //console.log("Company employer data:", data);

  const hasCompany = !!data && data.length > 0;

  return hasCompany;
}

/**
 * Retrieves the details of a user's company based on the employer ID.
 * @param {EmployerDetails} employerId - The ID of the employer.
 * @returns {Promise<CompanyEmployerRecord | null>} - A promise that resolves to the company employer record or null if an error occurs.
 */
export async function getUserCompanyDetails({
  employerId,
}: EmployerDetails): Promise<CompanyEmployerRecord | null> {
  const { data, error } = await supabase
    .from("company_employers")
    .select("employer_uuid, company_id")
    .eq("employer_uuid", employerId)
    .not("company_id", "is", null) // Ensure company_id is not null
    .single();

  if (error) {
    console.error("Error fetching user company details:", error);
    return null;
  }

  console.log("User company details:", data);

  return data;
}
