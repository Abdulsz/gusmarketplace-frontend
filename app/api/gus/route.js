import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;
const API_KEY = process.env.BACKEND_API_KEY;

// GET /api/gus - Fetch all listings
export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/gus`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      cache: "no-store", // Always fetch fresh data from backend
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", response.status, errorText);
      return NextResponse.json(
        { error: errorText || "Failed to fetch listings" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
