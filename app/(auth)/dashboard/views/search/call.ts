"use server";
import { write } from "@/lib/neo4j/utils";

const query = `MATCH (n:Role)
RETURN n`;

export async function FindRoles() {
  const result = await write(query);
  console.log(result);

  return;
}
