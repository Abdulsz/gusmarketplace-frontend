// Use environment variable for API base URL, fallback to localhost for development
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api/v1/gus';

export async function getListings() {
  const res = await fetch(`${BASE}`);
  if (!res.ok) throw new Error('Failed to fetch listings');
  return res.json();
}

export async function createListing(token, payload) {
  const res = await fetch(`${BASE}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create listing');
}

export async function deleteListing(token, id) {
  const res = await fetch(`${BASE}/delete/${id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to delete listing');
}


