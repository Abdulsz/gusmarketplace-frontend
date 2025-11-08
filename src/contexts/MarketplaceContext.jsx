import { createContext, useContext, useState } from 'react';

const MarketplaceContext = createContext(null);

export function MarketplaceProvider({ children }) {
  const [showMyListingsOnly, setShowMyListingsOnly] = useState(false);
  const [onAddListing, setOnAddListing] = useState(null);

  return (
    <MarketplaceContext.Provider value={{ 
      showMyListingsOnly, 
      setShowMyListingsOnly,
      onAddListing,
      setOnAddListing
    }}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  return useContext(MarketplaceContext);
}

