import { NextResponse } from "next/server";
import { fetchListingsFromBackend } from "@/lib/server/gus";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

// GET /api/gus - Fetch all listings
export async function GET() {
  try {
    const data = await fetchListingsFromBackend();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("API route error:", error);

    // Extract status code if available from error message
    const statusMatch = error.message?.match(/\b(\d{3})\b/);
    const status = statusMatch ? parseInt(statusMatch[1]) : 500;

    // Extract error message, removing status code prefix if present
    const errorMessage =
      error.message?.replace(/^Backend error: \d{3} - /, "") ||
      "Internal server error";

    return NextResponse.json({ error: errorMessage }, { status });
  }
}
