import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient';
import { createListing } from '../api/gus';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { X, Filter } from 'lucide-react';

export default function Marketplace() {
  const { showMyListingsOnly, setShowMyListingsOnly, setOnAddListing } = useMarketplace() || {};
  
  const [listings, setListings] = useState([])
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
      alert('Please log in to create a listing.');
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
      const response = await fetch(
        "http://localhost:8082/api/v1/gus",
        { method: "GET", headers:{ "Content-Type": "application/json" } }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setListings(data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  }

  useEffect(() =>{
    handleListingDisplay();
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
    return () => { sub.subscription.unsubscribe() }
  },[]);

  const isAdmin = userEmail === 'mahatnitai@gmail.com';
  
  const isListingOwner = (listingUserId) => {
    return listingUserId === userId;
  };
  
  const shouldShowDeleteButton = (listing) => {
    if (!session) return false;
    if (isAdmin) return true;
    return isListingOwner(listing.userId);
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

  let filteredListings = (showMyListingsOnly && userId && session) 
    ? listings.filter(listing => isListingOwner(listing.userId))
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
    if (!accessToken) { alert('Please log in to create a listing.'); return; }
    
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
    if (!listingSocialLink || !listingSocialLink.trim()) {
      setSubmitError('GroupMe link is required');
      return;
    }
    const groupMePattern = /^(https?:\/\/(web\.)?groupme\.com\/(contact\/|join_group\/)|groupme:\/\/join_group\/).+/;
    if (!groupMePattern.test(listingSocialLink.trim())) {
      setSubmitError('Invalid GroupMe link format. Please provide a valid GroupMe link (e.g., https://groupme.com/contact/...).');
      return;
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
    } catch (error) {
      console.error("Error creating listing:", error);
      setSubmitError(error.message || 'Failed to create listing');
    }
    finally { setSubmitLoading(false); }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!accessToken) { 
      alert('Please log in to upload an image.'); 
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
    if (!accessToken) { alert('Please log in to delete your listing.'); return; }
    try {
      const res = await fetch(`http://localhost:8082/api/v1/gus/delete/${id}`, { method: 'POST', headers: { "Authorization": `Bearer ${accessToken}` } })
      if (!res.ok) throw new Error('Delete failed')
      handleListingDisplay()
    } catch (e) {
      alert('Could not delete (only owners can delete).')
    }
  }

  const handleContactSeller = () => {
    if (!session) {
      alert('Please log in to contact the seller.');
      return;
    }
    if (selectedListing && selectedListing.userId === userId) {
      alert('You cannot contact yourself about your own listing.');
      return;
    }
    setContactMessageOpen(true);
  };

  const handleSendMessage = async () => {
    if (!contactMessage.trim()) {
      alert('Please enter a message.');
      return;
    }
    if (!accessToken || !selectedListing) return;

    try {
      setSendingEmail(true);
      const response = await fetch(`http://localhost:8082/api/v1/gus/contact-seller/${selectedListing.id}`, {
        method: 'POST',
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${accessToken}` 
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
      alert('Message sent successfully! The seller will receive an email.');
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
      alert(errorMessage);
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
                <textarea
                  id="description"
              value={listingDescription} 
              onChange={(e) => setListingDescription(e.target.value)} 
              required 
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <Label htmlFor="groupme">GroupMe Link *</Label>
                <Input 
                  id="groupme"
              value={listingSocialLink} 
              onChange={(e) => setListingSocialLink(e.target.value)} 
              required
              placeholder="https://groupme.com/contact/000000/azAq9h4l"
                />
                <p className="text-xs text-muted-foreground">Required: Enter your GroupMe contact link</p>
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
                <div className="w-full max-h-48 overflow-hidden rounded-md border">
                <img 
                  src={listingImagePreview} 
                  alt="Preview" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
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
                  <div className="w-full h-64 md:h-96 relative rounded-lg overflow-hidden bg-muted">
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
                      {selectedListing.userId !== userId && (
                        <div className="flex flex-col sm:flex-row gap-2">
                  {selectedListing.groupMeLink && (
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
                    <div className="p-4 bg-muted/50 rounded-lg">
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
                <textarea
                  id="message"
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              rows={5}
              required
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="mb-8 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                <Filter className="h-4 w-4" />
          {(selectedCategory || priceSort !== 'none') && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#002F6C]"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => {
              setSelectedCategory('');
              setPriceSort('none');
              }}>
                Clear Filters
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                const categories = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Other'];
                const currentIndex = categories.indexOf(selectedCategory);
                const nextCategory = currentIndex === -1 ? categories[0] : categories[(currentIndex + 1) % categories.length];
                setSelectedCategory(nextCategory);
                setPriceSort('none');
              }}>
                Category: {selectedCategory || 'All'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                if (priceSort === 'none') setPriceSort('high');
                else if (priceSort === 'high') setPriceSort('low');
                else setPriceSort('none');
                setSelectedCategory('');
              }}>
                Price: {priceSort === 'high' ? 'High to Low' : priceSort === 'low' ? 'Low to High' : 'None'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredListings.map((listing) => (
            <div 
              key={listing.id} 
              className="cursor-pointer group"
              onClick={() => handleDetailsOpen(listing)}
            >
              <div className="relative aspect-square overflow-hidden mb-2">
                {listing.imageUrl ? (
                  <img 
                    src={listing.imageUrl} 
                    alt={listing.title} 
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-muted">
                    📦
                  </div>
                )}
                {shouldShowDeleteButton(listing) && (
                  <Button 
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-red-500/90 hover:bg-red-600 border-0"
                    onClick={(e) => {
                      e.stopPropagation(); 
                      handleDelete(listing.id);
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
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
        {filteredListings.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">No listings found</p>
          </div>
        )}
      </div>
    </div>
  )
}
