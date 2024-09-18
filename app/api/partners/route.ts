import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SUPABASE_BASE_URL =
  "https://jiccshhthuhmcudiyljl.supabase.co/storage/v1/object/public/partners/companies/";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const partnerLogo = searchParams.get("partnerLogo");
  const imageType = searchParams.get("type") || "logo";

  if (!partnerLogo) {
    return new NextResponse("Company ID is required", { status: 400 });
  }

  const imageUrl = `${SUPABASE_BASE_URL}${partnerLogo}/${partnerLogo}_${imageType}.png`;

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }

    const contentType = response.headers.get("content-type");
    const buffer = await response.arrayBuffer();

    // Validate content type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    const finalContentType = validTypes.includes(contentType || "")
      ? contentType
      : "image/png";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": finalContentType || "image/png",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    return new NextResponse("This company image does not exist.", {
      status: 404,
    });
  }
}
