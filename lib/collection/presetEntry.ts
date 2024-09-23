"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function fetchPresetEntry(owner: string, entryID: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  let title = "";
  let content = "";

  const { data: intro, error: introError } = await supabase
    .from("collections")
    .select("title, content")
    .eq("snippet_id", entryID)
    .eq("owner", owner);

  if (introError) {
    throw new Error(introError.message);
  }

  if (intro && intro.length > 0) {
    title = intro[0].title;
    content = intro[0].content;
  }

  return { title, content };
}

export async function savePresetEntry(
  owner: string,
  entryID: string,
  title: string,
  content: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error: saveError } = await supabase
    .from("collections")
    .update({ title, content }) // update title and content
    .eq("snippet_id", entryID)
    .eq("owner", owner);

  if (saveError) {
    return {
      success: false,
    };
  }

  return {
    success: true,
  };
}

export async function deletePresetEntry(
  owner: string,
  entryID: string,
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error: deleteError } = await supabase
    .from("collections")
    .delete()
    .eq("snippet_id", entryID)
    .eq("owner", owner);

  if (deleteError) {
    return {
      success: false,
    };
  }

  return {
    success: true,
  };
}

export async function createPresetEntry(
  owner: string,
  title: string,
  content: string,
  type: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error: saveError } = await supabase
    .from("collections")
    .insert([{ owner, title, content, type }]);

  if (saveError) {
    //console.log(saveError);
    return {
      success: false,
    };
  }

  return {
    success: true,
  };
}
