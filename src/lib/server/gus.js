// Server-side only - never imported in client components
// Shared function for fetching listings from backend
// Keeps API keys centralized and secure

const BACKEND_URL = process.env.BACKEND_URL;
const API_KEY = process.env.BACKEND_API_KEY;

/**
 * Fetches listings from the backend API
 * This is a server-side only function that contains API keys
 * @returns {Promise<Array>} Array of listings
 * @throws {Error} If backend request fails or config is missing
 */
export async function fetchListingsFromBackend() {
  if (!BACKEND_URL || !API_KEY) {
    console.error("Missing BACKEND_URL or BACKEND_API_KEY environment variables");
    throw new Error("Backend configuration missing");
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/gus`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    next: { revalidate: 30 }, // Cache for 30 seconds
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend error: ${response.status} - ${errorText || "Failed to fetch listings"}`);
  }

  return await response.json();
}
