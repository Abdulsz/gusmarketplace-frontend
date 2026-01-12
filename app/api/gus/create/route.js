import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;
const API_KEY = process.env.BACKEND_API_KEY;

// POST /api/gus/create - Create a listing
export async function POST(request) {
  try {
    const incomingFormData = await request.formData();

    // Reconstruct FormData for the backend request
    // This ensures proper serialization when forwarding to Spring
    const outgoingFormData = new FormData();
    for (const [key, value] of incomingFormData.entries()) {
      if (value instanceof File) {
        // Convert File to Blob with proper filename for Node.js fetch compatibility
        const arrayBuffer = await value.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: value.type });
        outgoingFormData.append(key, blob, value.name);
      } else {
        outgoingFormData.append(key, value);
      }
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/gus/create`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
      },
      body: outgoingFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", response.status, errorText);
      return NextResponse.json(
        { error: errorText || "Failed to create listing" },
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
