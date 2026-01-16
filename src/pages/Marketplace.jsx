'use client';
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient';
import { getListings, createListing, deleteListing } from '../api/gus';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { X, Filter, Package } from 'lucide-react';

export default function Marketplace({ initialListings = [] }) {
  const { showMyListingsOnly, setShowMyListingsOnly, setOnAddListing } = useMarketplace() || {};
  const { toast } = useToast();
  
  const [listings, setListings] = useState(initialListings)
  const [loading, setLoading] = useState(initialListings.length === 0)
  const [session, setSession] = useState(null)
  const [accessToken, setAccessToken] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')

  const [listingTitle, setListingTitle] = useState("")
  const [listingDescription, setListingDescription] = useState("")
  const [listingImageFile, setListingImageFile] = useState(null)
  const [listingImagePreview, setListingImagePreview] = useState(null)
  const [listingPrice, setListingPrice] = useState("")
  const [listingCondition, setListingCondition] = useState("")
  const [listingSocialLink, setListingSocialLink] = useState("")
  const [listingCategory, setListingCategory] = useState("")
  const [listingUserName, setListingUserName] = useState("")
  const [selectedListing, setSelectedListing] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [contactMessageOpen, setContactMessageOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceSort, setPriceSort] = useState('none');

  const handleOpen = () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a listing.",
        variant: "destructive",
      });
      return;
    }
    setListingUserName(userEmail || '');
    setOpen(true);
  };
  
  useEffect(() => {
    if (setOnAddListing) {
      setOnAddListing(() => handleOpen);
    }
  }, [setOnAddListing, userEmail, session]);
  
  const handleClose = () => {
    if (listingImagePreview) {
      URL.revokeObjectURL(listingImagePreview);
      setListingImagePreview(null);
    }
    setOpen(false);
    setSubmitError('');
    setListingUserName(userEmail || '');
  };

  const handleListingDisplay = async () => {
    try{
      setLoading(true);
      const data = await getListings();
      setListings(data);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() =>{
    // If we have initial listings from server, refresh in background after a short delay
    // Otherwise, fetch immediately
    let timeoutId = null;
    if (initialListings.length > 0) {
      // Silently refresh in background after 1 second to ensure freshness
      timeoutId = setTimeout(() => {
        handleListingDisplay();
      }, 1000);
    } else {
      // No initial data, fetch immediately
      handleListingDisplay();
    }
    
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      setAccessToken(data.session?.access_token ?? '')
      setUserEmail(data.session?.user?.email ?? '')
      setUserId(data.session?.user?.id ?? '')
      setListingUserName(data.session?.user?.email ?? '')
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setAccessToken(s?.access_token ?? '')
      setUserEmail(s?.user?.email ?? '')
      setUserId(s?.user?.id ?? '')
      setListingUserName(s?.user?.email ?? '')
    })
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      sub.subscription.unsubscribe();
    }
  },[]);

  const isAdmin = userEmail === 'mahatnitai@gmail.com';
  
  const isListingOwner = (listingUserName) => {
    return listingUserName === userEmail;
  };
  
  const shouldShowDeleteButton = (listing) => {
    if (!session) return false;
    if (isAdmin) return true;
    return isListingOwner(listing.userName);
  };

  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const cleaned = priceStr.toString().replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const formatPrice = (priceStr) => {
    if (!priceStr) return '$0';
    const cleaned = priceStr.toString().replace(/[^0-9.]/g, '');
    if (!cleaned) return '$0';
    return `$${cleaned}`;
  };

  let filteredListings = (showMyListingsOnly && userEmail && session) 
    ? listings.filter(listing => isListingOwner(listing.userName))
    : listings;

  if (selectedCategory) {
    filteredListings = filteredListings.filter(listing => listing.category === selectedCategory);
  }

  if (priceSort === 'high') {
    filteredListings = [...filteredListings].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  } else if (priceSort === 'low') {
    filteredListings = [...filteredListings].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  }

  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setListingPrice(value);
    }
  };

  const handleSubmit = async () => {
    if (!accessToken) { 
      toast({
        title: "Authentication required",
        description: "Please log in to create a listing.",
        variant: "destructive",
      });
      return;
    }
    
    if (!listingTitle.trim()) {
      setSubmitError('Title is required');
      return;
    }
    if (!listingDescription.trim()) {
      setSubmitError('Description is required');
      return;
    }
    if (!listingPrice.trim()) {
      setSubmitError('Price is required');
      return;
    }
    if (!listingImageFile) {
      setSubmitError('Photo is required. Please upload an image.');
      return;
    }
    if (!listingCategory) {
      setSubmitError('Category is required');
      return;
    }
    if (!listingCondition) {
      setSubmitError('Condition is required');
      return;
    }
    // GroupMe link is optional but validate format if provided
    if (listingSocialLink && listingSocialLink.trim()) {
      const groupMePattern = /^(https?:\/\/(web\.)?groupme\.com\/(contact\/|join_group\/)|groupme:\/\/join_group\/).+/;
      if (!groupMePattern.test(listingSocialLink.trim())) {
        setSubmitError('Invalid GroupMe link format. Please provide a valid GroupMe link (e.g., https://groupme.com/contact/...).');
        return;
      }
    }
    
    try {
      setSubmitLoading(true);
      setSubmitError('');
      await createListing(accessToken, {
        userName: listingUserName || userEmail,
        category: listingCategory,
        title: listingTitle,
        description: listingDescription,
        price: listingPrice,
        condition: listingCondition,
        groupMeLink: listingSocialLink
      }, listingImageFile);
      if (listingImagePreview) {
        URL.revokeObjectURL(listingImagePreview);
      }
      setListingUserName(userEmail || ""); 
      setListingCategory(""); 
      setListingTitle(""); 
      setListingDescription(""); 
      setListingImageFile(null); 
      setListingImagePreview(null); 
      setListingPrice(""); 
      setListingCondition(""); 
      setListingSocialLink("");
      handleClose();
      handleListingDisplay();
      toast({
        title: "Success",
        description: "Your listing has been created successfully.",
      });
    } catch (error) {
      console.error("Error creating listing:", error);
      setSubmitError(error.message || 'Failed to create listing');
      toast({
        title: "Error",
        description: error.message || 'Failed to create listing',
        variant: "destructive",
      });
    }
    finally { setSubmitLoading(false); }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!accessToken) { 
      toast({
        title: "Authentication required",
        description: "Please log in to upload an image.",
        variant: "destructive",
      });
      return; 
    }
    if (listingImagePreview) {
      URL.revokeObjectURL(listingImagePreview);
    }
    setListingImageFile(file);
    setListingImagePreview(URL.createObjectURL(file));
  };

  const handleDetailsOpen = (listing) => { setSelectedListing(listing); setDetailsOpen(true); };
  const handleDetailsClose = () => { setDetailsOpen(false); setSelectedListing(null); };

  const handleDelete = async (id) => {
    if (!accessToken) { 
      toast({
        title: "Authentication required",
        description: "Please log in to delete your listing.",
        variant: "destructive",
      });
      return;
    }
    try {
      await deleteListing(accessToken, id);
      handleListingDisplay();
      toast({
        title: "Success",
        description: "Listing deleted successfully.",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Could not delete listing. Only owners can delete their listings.",
        variant: "destructive",
      });
    }
  }

  const handleContactSeller = () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please log in to contact the seller.",
        variant: "destructive",
      });
      return;
    }
    if (selectedListing && selectedListing.userName === userEmail) {
      toast({
        title: "Not allowed",
        description: "You cannot contact yourself about your own listing.",
        variant: "destructive",
      });
      return;
    }
    setContactMessageOpen(true);
  };

  const handleSendMessage = async () => {
    if (!contactMessage.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message.",
        variant: "destructive",
      });
      return;
    }
    if (!accessToken || !selectedListing) return;

    try {
      setSendingEmail(true);
      const response = await fetch(`/api/gus/contact-seller/${selectedListing.id}`, {
        method: 'POST',
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          buyerName: userEmail || 'Buyer',
          message: contactMessage
        }),
      });

      if (!response.ok) {
        let errorText = '';
        try {
          const errorJson = await response.json();
          errorText = errorJson.error || errorJson.message || JSON.stringify(errorJson);
        } catch (e) {
          errorText = await response.text();
        }
        console.error("Error response:", errorText);
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: "Message sent successfully! The seller will receive an email.",
      });
      setContactMessage('');
      setContactMessageOpen(false);
    } catch (error) {
      console.error("Error sending message:", error);
      let errorMessage = 'Failed to send message. Please try again.';
      if (error.message) {
        try {
          const parsedError = JSON.parse(error.message);
          errorMessage = parsedError.error || parsedError.message || errorMessage;
        } catch (e) {
          errorMessage = error.message;
        }
        
        if (errorMessage.includes('Domain not verified') || errorMessage.includes('DNS')) {
          errorMessage = 'Email service is not fully configured. Please contact support.';
        } else if (errorMessage.includes('Authentication failed') || errorMessage.includes('401')) {
          errorMessage = 'Email service authentication failed. Please contact support.';
        } else if (errorMessage.includes('403')) {
          errorMessage = 'Domain not verified. Please verify DNS settings.';
        }
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Add Listing Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-[#002F6C]">
                Create New Listing
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username"
              value={listingUserName || userEmail} 
              disabled 
                />
                <p className="text-xs text-muted-foreground">Username is automatically set to your registered email</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input 
                  id="title"
              value={listingTitle} 
              onChange={(e) => setListingTitle(e.target.value)} 
              required 
                  placeholder="Enter listing title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
              value={listingDescription} 
              onChange={(e) => setListingDescription(e.target.value)} 
              required 
                  rows={3}
                  placeholder="Add product description or contact info"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input 
                  id="price"
              value={listingPrice} 
              onChange={handlePriceChange} 
              required 
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={listingCategory} onValueChange={setListingCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Clothing">Clothing</SelectItem>
                    <SelectItem value="Books">Books</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
              </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select value={listingCondition} onValueChange={setListingCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Like New">Like New</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
              </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="groupme">GroupMe Link</Label>
                <Input 
                  id="groupme"
              value={listingSocialLink} 
              onChange={(e) => setListingSocialLink(e.target.value)} 
              placeholder="https://groupme.com/contact/000000/azAq9h4l"
                />
                <p className="text-xs text-muted-foreground">Recommended: Email notifications can sometimes go to spam. Adding your GroupMe link ensures buyers can reach you directly.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Upload Picture *</Label>
                <Input 
                  id="image"
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageSelect} 
                  required 
                  className="cursor-pointer"
                />
                {listingImageFile && (
                  <p className="text-xs text-muted-foreground">Selected: {listingImageFile.name}</p>
                )}
              </div>
            {listingImagePreview && (
                <div className="w-full max-h-48 overflow-hidden rounded-xl border">
                <img 
                  src={listingImagePreview} 
                  alt="Preview" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button 
                disabled={submitLoading} 
                onClick={handleSubmit}
                className="bg-[#002F6C] hover:bg-[#004080] text-white"
              >
                {submitLoading ? 'Submitting…' : 'Submit'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Product Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-0 shadow-xl">
          {selectedListing && (
            <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-[#002F6C] capitalize">
                    {selectedListing.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="w-full h-64 md:h-96 relative rounded-xl overflow-hidden bg-muted">
                    {selectedListing.imageUrl && (
                      <img 
                        src={selectedListing.imageUrl} 
                        alt={selectedListing.title} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {session ? (
                    <>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                        <p className="text-sm">{selectedListing.description}</p>
                      </div>
                      {selectedListing.userName !== userEmail && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          {selectedListing.groupMeLink && selectedListing.groupMeLink.trim() && (
                            <Button
                              variant="outline"
                              asChild
                              className="bg-[#00AFF0] hover:bg-[#0099d6] text-white border-[#00AFF0]"
                            >
                              <a
                                href={selectedListing.groupMeLink}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Contact via GroupMe
                              </a>
                            </Button>
                          )}
                          <Button
                            onClick={handleContactSeller}
                            className="bg-[#002F6C] hover:bg-[#004080] text-white"
                          >
                            Contact via Email
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Login required.</span> Please log in to view the description and contact the seller.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/50">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Price</p>
                      <p className="text-base font-semibold text-[#002F6C]">{formatPrice(selectedListing.price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Condition</p>
                      <p className="text-sm">{selectedListing.condition}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Category</p>
                      <p className="text-sm">{selectedListing.category}</p>
                    </div>
                  </div>
                </div>
            </>
          )}
          </DialogContent>
        </Dialog>

        {/* Contact Seller Dialog */}
        <Dialog open={contactMessageOpen} onOpenChange={setContactMessageOpen}>
          <DialogContent className="border-0 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-[#002F6C]">
                Contact Seller
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              rows={5}
              required
              placeholder="Type your message to the seller here..."
            />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline" 
                onClick={() => {
                  setContactMessageOpen(false);
                  setContactMessage('');
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={sendingEmail || !contactMessage.trim()}
                onClick={handleSendMessage}
                className="bg-[#002F6C] hover:bg-[#004080] text-white"
              >
                {sendingEmail ? 'Sending...' : 'Send Message'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      {/* Filter Section */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {selectedCategory && (
              <Badge variant="secondary" className="gap-1">
                {selectedCategory}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
              </Badge>
            )}
            {priceSort !== 'none' && (
              <Badge variant="secondary" className="gap-1">
                {priceSort === 'high' ? 'Price: High to Low' : 'Price: Low to High'}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setPriceSort('none')} />
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => {
              setSelectedCategory('');
              setPriceSort('none');
              }}>
                Clear All Filters
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                const categories = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Other'];
                const currentIndex = categories.indexOf(selectedCategory);
                const nextCategory = currentIndex === -1 ? categories[0] : categories[(currentIndex + 1) % categories.length];
                setSelectedCategory(nextCategory);
              }}>
                Category: {selectedCategory || 'All'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                if (priceSort === 'none') setPriceSort('high');
                else if (priceSort === 'high') setPriceSort('low');
                else setPriceSort('none');
              }}>
                Price: {priceSort === 'high' ? 'High to Low' : priceSort === 'low' ? 'Low to High' : 'None'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-24">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-1">No listings found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {showMyListingsOnly 
                ? "You haven't created any listings yet." 
                : selectedCategory || priceSort !== 'none'
                ? "Try adjusting your filters."
                : "Be the first to create a listing!"}
            </p>
            {session && !showMyListingsOnly && (
              <Button onClick={handleOpen} className="bg-[#002F6C] hover:bg-[#004080]">
                Create Your First Listing
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredListings.map((listing) => (
              <div 
                key={listing.id} 
                className="cursor-pointer group"
                onClick={() => handleDetailsOpen(listing)}
              >
                <div className="relative aspect-square overflow-hidden mb-2 rounded-xl border border-border/50">
                  {listing.imageUrl ? (
                    <img 
                      src={listing.imageUrl} 
                      alt={listing.title} 
                      className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  {shouldShowDeleteButton(listing) && (
                    <Button 
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-7 px-2 rounded-lg bg-red-500/90 hover:bg-red-600 border-0 text-xs font-medium"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleDelete(listing.id);
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
                <div className="bg-transparent space-y-1">
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    {listing.title}
                  </p>
                  <p className="font-medium text-base text-[#002F6C]">
                    {formatPrice(listing.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
