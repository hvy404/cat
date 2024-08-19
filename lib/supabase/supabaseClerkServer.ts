/**
 * Creates a Supabase client instance with the Clerk Supabase token injected into the request headers.
 * This allows Clerk-authenticated users to access the Supabase API with their Clerk session token.
 * Cookies do not have to be exchanged via next/headers
 *
 * @returns {SupabaseClient} A Supabase client instance with the Clerk token injected.
 */

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export function createClerkSupabaseClient() {
  const { getToken } = auth();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      global: {
        // Get the Supabase token with a custom fetch method
        fetch: async (url, options = {}) => {
          const clerkToken = await getToken({
            template: "supabase-talent",
          });

          // Insert the Clerk Supabase token into the headers
          const headers = new Headers(options?.headers);
          headers.set("Authorization", `Bearer ${clerkToken}`);

          // Now call the default fetch
          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );
}

// Example:
// import { createClerkSupabaseClient } from "@/lib/supabase/supabaseClerkServer";
// const supabase = createClerkSupabaseClient();
