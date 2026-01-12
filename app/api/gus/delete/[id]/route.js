import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;
const API_KEY = process.env.BACKEND_API_KEY;

// POST /api/gus/delete/[id] - Delete a listing
export async function POST(request, { params }) {
  try {
    const { id } = await params;

    const response = await fetch(`${BACKEND_URL}/api/v1/gus/delete/${id}`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", response.status, errorText);
      return NextResponse.json(
        { error: errorText || "Failed to delete listing" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
