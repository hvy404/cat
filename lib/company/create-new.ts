"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// Wrapper function to get Supabase client
const getSupabase = () => {
  const cookieStore = cookies();
  return createClient(cookieStore);
};

interface EmployerDetails {
  employerId?: string;
  companyId: string;
  companyName?: string;
  role?: "admin" | "manager" | "employee";
}

export async function addNewCompanyEntry(
  companyId: string,
  companyName: string
): Promise<{ success: boolean; error?: string }> {
  if (!companyId) {
    return { success: false, error: "Company ID is required" };
  }

  const supabase = getSupabase();

  try {
    const { error } = await supabase
      .from("companies")
      .insert([
        {
          company_id: companyId,
          last_modified: new Date().toISOString(),
          name: companyName,
        },
      ])
      .single();

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error adding new company entry:", error);
    return {
      success: false,
      error:
        "There was an error adding the new company entry. Please try again.s",
    };
  }
}

export async function addEmployeeToCompany({
  employerId,
  companyId,
  role,
}: EmployerDetails): Promise<{ success: boolean; error?: string }> {
  if (!employerId || !companyId || !role) {
    return {
      success: false,
      error: "Missing required information. Please try your request again.",
    };
  }

  const supabase = getSupabase();

  try {
    // If the role is "admin", check if there's already an admin for this company
    if (role === "admin") {
      const { data: existingAdmin, error: adminCheckError } = await supabase
        .from("company_employers")
        .select("employer_id")
        .eq("company_id", companyId)
        .eq("role", "admin")
        .single();

      if (adminCheckError && adminCheckError.code !== "PGRST116") {
        // PGRST116 is the error code for no rows returned, which is what we want
        throw adminCheckError;
      }

      if (existingAdmin) {
        return {
          success: false,
          error: "An administrator already exists for this company. Only one administrator is allowed per company.",
        };
      }
    }

    // If we've passed the admin check (or if the role isn't admin), proceed with insertion
    const { error } = await supabase
      .from("company_employers")
      .insert([
        { employer_id: employerId, company_id: companyId, role: role },
      ])
      .single();

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error adding employee to company:", error);
    return {
      success: false,
      error: "There was an error adding the employee to the company. Please try again.",
    };
  }
}

/**
 * Updates the employer's company ID in the database.
 * @param employerId - The ID of the employer.
 * @param companyId - The ID of the company.
 * @returns A promise that resolves to an object with a success flag and an optional error message.
 */
export async function updateEmployerCompanyId(employerId: string, companyId: string): Promise<{ success: boolean; error?: string }> {
  if (!employerId || !companyId) {
    return {
      success: false,
      error: "Missing required information. Please provide both employerId and companyId.",
    };
  }

  const supabase = getSupabase();

  try {
    const { error } = await supabase
      .from("employers")
      .update({ company_id: companyId })
      .eq("employer_id", employerId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error updating employer's company_id:", error);
    return {
      success: false,
      error: "There was an error updating the employer's company ID. Please try again.",
    };
  }
}