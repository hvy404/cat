"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { SupabaseClient } from "@supabase/supabase-js";

type FetchSuggestionRolesProps = string | { userId: string };

interface CandidateResume {
  inferred: {
    soft_skills?: string[];
    potential_roles?: string[];
  } | null;
}

interface FetchResult {
  potentialRoles: string[] | null;
  status: 'success' | 'error' | 'empty';
  message?: string;
}


async function getFetchSuggestionRoles(props: FetchSuggestionRolesProps): Promise<FetchResult> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const userId = typeof props === 'string' ? props : props.userId;
    return await fetchSuggestionRoles(supabase, userId);
  } catch (error) {
    console.error("Unexpected error in getFetchSuggestionRoles:", error);
    return {
      potentialRoles: null,
      status: 'error',
      message: 'An unexpected error occurred'
    };
  }
}

async function fetchSuggestionRoles(supabase: SupabaseClient, userId: string): Promise<FetchResult> {
  try {
    const { data, error } = await supabase
      .from("candidate_create")
      .select("inferred")
      .eq("user", userId)
      .single();

    if (error) {
      console.error("Error fetching suggestion roles:", error.message);
      return {
        potentialRoles: null,
        status: 'error',
        message: 'Error fetching data from database'
      };
    }

    if (!data || !data.inferred) {
      console.warn(`No inferred data found for user ${userId}`);
      return {
        potentialRoles: null,
        status: 'empty',
        message: 'No inferred data found'
      };
    }

    const inferredData = data.inferred;

    if (!inferredData.potential_roles || inferredData.potential_roles.length === 0) {
      return {
        potentialRoles: null,
        status: 'empty',
        message: 'No potential roles found in inferred data'
      };
    }

    return {
      potentialRoles: inferredData.potential_roles,
      status: 'success'
    };
  } catch (error) {
    console.error("Unexpected error in fetchSuggestionRoles:", error);
    return {
      potentialRoles: null,
      status: 'error',
      message: 'An unexpected error occurred while fetching data'
    };
  }
}

export default getFetchSuggestionRoles;