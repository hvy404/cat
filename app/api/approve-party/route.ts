import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Handles the POST request to the /approve-party API endpoint.
 * This endpoint is used to approve a user's email address and mark it as having viewed the demo.
 *
 * @param req - The incoming HTTP request object.
 * @returns A JSON response indicating the success or failure of the operation.
 */
export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const jwtSecret = process.env.STAFF_PARTY_APPROVE_JWT_SECRET;

  const cookieStore = cookies();
  const supabaseClient = createClient(cookieStore);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, jwtSecret as string);

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await supabaseClient.from("approved").insert({
      email: email,
      demo_viewed: true,
    });

    return NextResponse.json(
      { message: "Email received and processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
