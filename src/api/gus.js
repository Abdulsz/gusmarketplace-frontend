const BASE = "http://localhost:8082/api/v1/gus";

export async function getListings() {
  const res = await fetch(`${BASE}`);
  if (!res.ok) throw new Error("Failed to fetch listings");
  return res.json();
}

export async function createListing(token, payload, imageFile = null) {
  const formData = new FormData();
  formData.append("userName", payload.userName);
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
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type - browser will set it with boundary for multipart/form-data
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to create listing");
  }

  return res.json();
}

export async function deleteListing(token, id) {
  const res = await fetch(`${BASE}/delete/${id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to delete listing");
}
