"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { SupabaseClient } from "@supabase/supabase-js";
import { initializeRedis } from "@/lib/redis/connect"; // upstash/redis client

type FetchSuggestionRolesProps = string | { userId: string };

interface CandidateResume {
  inferred: {
    soft_skills?: string[];
    potential_roles?: string[];
  } | null;
}

interface FetchResult {
  potentialRoles: string[] | null;
  status: "success" | "error" | "empty";
  message?: string;
}

const BOOKMARK_CACHE_TTL = 300; // 5 minutes in seconds

async function getFetchSuggestionRoles(
  props: FetchSuggestionRolesProps
): Promise<FetchResult> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const redis = initializeRedis();

  try {
    const userId = typeof props === "string" ? props : props.userId;
    const suggestionCacheKey = `suggestion_roles:${userId}`;

    // Check Redis cache first
    const cachedSuggestions = await redis.get<FetchResult>(suggestionCacheKey);

    if (cachedSuggestions) {
      return cachedSuggestions;
    }

    // If not in cache, fetch from database
    const result = await fetchSuggestionRoles(supabase, userId);

    // Cache the result if it's successful
    if (result.status === "success") {
      await redis.set(suggestionCacheKey, result, {
        ex: BOOKMARK_CACHE_TTL,
      });
    }

    return result;
  } catch (error) {
    console.error("Error fetching or caching suggestion roles:", error);
    return {
      potentialRoles: null,
      status: "error",
      message: "An unexpected error occurred",
    };
  }
}

async function fetchSuggestionRoles(
  supabase: SupabaseClient,
  userId: string
): Promise<FetchResult> {
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
        status: "error",
        message: "Error fetching data from database",
      };
    }

    if (!data || !data.inferred) {
      console.warn(`No inferred data found for user ${userId}`);
      return {
        potentialRoles: null,
        status: "empty",
        message: "No inferred data found",
      };
    }

    const inferredData = data.inferred;

    if (
      !inferredData.potential_roles ||
      inferredData.potential_roles.length === 0
    ) {
      return {
        potentialRoles: null,
        status: "empty",
        message: "No potential roles found in inferred data",
      };
    }

    return {
      potentialRoles: inferredData.potential_roles,
      status: "success",
    };
  } catch (error) {
    console.error("Unexpected error in fetchSuggestionRoles:", error);
    return {
      potentialRoles: null,
      status: "error",
      message: "An unexpected error occurred while fetching data",
    };
  }
}

export default getFetchSuggestionRoles;
