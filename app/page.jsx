import Marketplace from '@/pages/Marketplace';
import { fetchListingsFromBackend } from '@/lib/server/gus';

// Fetch listings server-side for faster initial page load
async function getInitialListings() {
  try {
    return await fetchListingsFromBackend();
  } catch (error) {
    console.error("Error fetching initial listings:", error);
    return [];
  }
}

export default async function Home() {
  const initialListings = await getInitialListings();
  return <Marketplace initialListings={initialListings} />;
}

