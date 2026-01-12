import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;
const API_KEY = process.env.BACKEND_API_KEY;

// POST /api/gus/contact-seller/[id] - Contact seller
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/v1/gus/contact-seller/${id}`,
      {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", response.status, errorText);
      return NextResponse.json(
        { error: errorText || "Failed to send message" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
