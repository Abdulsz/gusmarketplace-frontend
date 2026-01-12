// Use Next.js API routes instead of direct backend calls
const BASE = "/api/gus";

export async function getListings() {
  const res = await fetch(`${BASE}`, {
    cache: "no-store", // Disable caching to always get fresh data
  });
  if (!res.ok) throw new Error("Failed to fetch listings");
  return res.json();
}

// NOTE: `token` is currently unused (MVP: UI-level auth only)
export async function createListing(_token, payload, imageFile = null) {
  const formData = new FormData();
  formData.append("userName", payload.userName); // Email used for ownership tracking
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("category", payload.category);
  formData.append("price", payload.price);
  formData.append("condition", payload.condition);
  if (payload.groupMeLink) {
    formData.append("groupMeLink", payload.groupMeLink);
  }
  if (imageFile) {
    formData.append("imageFile", imageFile);
  }

  const res = await fetch(`${BASE}/create`, {
    method: "POST",
    // Don't set Content-Type - browser will set it with boundary for multipart/form-data
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to create listing");
  }

  return res.json();
}

// NOTE: `token` is currently unused (MVP: UI-level auth only)
export async function deleteListing(_token, id) {
  const res = await fetch(`${BASE}/delete/${id}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to delete listing");
}
