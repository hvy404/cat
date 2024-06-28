import { NextResponse } from "next/server";
import {
  recordProfileView,
  RecordProfileViewParams,
} from "@/lib/metrics/candidate/recordProfileView";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    if (!requestBody || !requestBody.candidateId) {
      return NextResponse.json(
        { message: "Candidate ID is required" },
        { status: 400 }
      );
    }
    const { candidateId } = requestBody;

    const viewerIp = request.headers.get("x-forwarded-for");
    if (!viewerIp) {
      return NextResponse.json(
        { message: "Viewer IP not found" },
        { status: 400 }
      );
    }

    await recordProfileView({
      candidateId,
      viewerIp,
    } as RecordProfileViewParams);

    return NextResponse.json(
      { message: "Profile view recorded" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error recording profile view:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
