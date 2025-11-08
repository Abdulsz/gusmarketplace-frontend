import { Box, Button, Stack, Typography, Modal, TextField, FormControl, InputLabel, Select, MenuItem, Link, Alert, Menu, ListItemText } from '@mui/material';
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient';
import { createListing } from '../api/gus';
import { useMarketplace } from '../contexts/MarketplaceContext';

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
  const [priceSort, setPriceSort] = useState('none'); // 'none', 'high', 'low'
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [categoryAnchorEl, setCategoryAnchorEl] = useState(null);
  const [priceAnchorEl, setPriceAnchorEl] = useState(null);
  const filterOpen = Boolean(filterAnchorEl);
  const categoryOpen = Boolean(categoryAnchorEl);
  const priceOpen = Boolean(priceAnchorEl);

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
    // Clean up image preview URL when closing modal
    if (listingImagePreview) {
      URL.revokeObjectURL(listingImagePreview);
      setListingImagePreview(null);
    }
    setOpen(false);
    setSubmitError('');
    // Reset username to email when closing
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

  // Check if current user is admin
  const isAdmin = userEmail === 'mahatnitai@gmail.com';
  
  // Check if listing belongs to current user
  const isListingOwner = (listingUserId) => {
    return listingUserId === userId;
  };
  
  // Determine if delete button should be shown
  const shouldShowDeleteButton = (listing) => {
    if (!session) return false;
    // Admin sees delete button on all listings
    if (isAdmin) return true;
    // Regular users only see delete button on their own listings
    return isListingOwner(listing.userId);
  };

  // Helper function to parse price string to number
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    // Remove $ and any non-numeric characters except decimal point
    const cleaned = priceStr.toString().replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  // Helper function to format price with dollar sign
  const formatPrice = (priceStr) => {
    if (!priceStr) return '$0';
    // Remove any existing $ sign and format
    const cleaned = priceStr.toString().replace(/[^0-9.]/g, '');
    if (!cleaned) return '$0';
    return `$${cleaned}`;
  };

  // Filter and sort listings
  // Only show "My Listings" filter if user is logged in
  let filteredListings = (showMyListingsOnly && userId && session) 
    ? listings.filter(listing => isListingOwner(listing.userId))
    : listings;

  // Apply category filter
  if (selectedCategory) {
    filteredListings = filteredListings.filter(listing => listing.category === selectedCategory);
  }

  // Apply price sorting
  if (priceSort === 'high') {
    filteredListings = [...filteredListings].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  } else if (priceSort === 'low') {
    filteredListings = [...filteredListings].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  }

  const handlePriceChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setListingPrice(value);
    }
  };

  const handleSubmit = async () => {
    if (!accessToken) { alert('Please log in to create a listing.'); return; }
    
    // Validate required fields
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
    // Validate GroupMe link format
    const groupMePattern = /^(https?:\/\/(web\.)?groupme\.com\/join_group\/|groupme:\/\/join_group\/).+/;
    if (!groupMePattern.test(listingSocialLink.trim())) {
      setSubmitError('Invalid GroupMe link format. Please provide a valid GroupMe link (e.g., https://groupme.com/join_group/...).');
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
      // Clean up image preview URL
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
    // Revoke previous object URL if it exists
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
    // Don't allow sellers to contact themselves
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
        // Parse JSON error if it's a JSON string
        try {
          const parsedError = JSON.parse(error.message);
          errorMessage = parsedError.error || parsedError.message || errorMessage;
        } catch (e) {
          // Not JSON, use the message as-is
          errorMessage = error.message;
        }
        
        // Provide user-friendly messages for common errors
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

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
    setCategoryAnchorEl(null);
    setPriceAnchorEl(null);
  };

  const handleCategoryClick = (event) => {
    event.stopPropagation();
    setPriceAnchorEl(null); // Close price menu if open
    setCategoryAnchorEl(event.currentTarget);
  };

  const handleCategoryClose = () => {
    setCategoryAnchorEl(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setPriceSort('none');
    handleCategoryClose();
    handleFilterClose();
  };

  const handlePriceClick = (event) => {
    event.stopPropagation();
    setCategoryAnchorEl(null); // Close category menu if open
    setPriceAnchorEl(event.currentTarget);
  };

  const handlePriceClose = () => {
    setPriceAnchorEl(null);
  };

  const handlePriceSort = (sort) => {
    setPriceSort(sort);
    setSelectedCategory('');
    handlePriceClose();
    handleFilterClose();
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: '#FFFFFF',
      py: 4,
      position: 'relative',
    }}>
      
      <Box sx={{ maxWidth: '1400px', mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, position: 'relative', zIndex: 1 }}>

      <Modal 
        open={open} 
        onClose={handleClose} 
        aria-labelledby="modal-modal-title" 
        aria-describedby="modal-modal-description"
        sx={{
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          width: { xs: '95%', sm: '90%', md: 500 }, 
          maxWidth: '95vw',
          maxHeight: { xs: '90vh', sm: '85vh' },
          overflowY: 'auto',
          bgcolor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: { xs: '16px', sm: '24px' }, 
          boxShadow: '0 20px 60px rgba(25, 118, 210, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5)',
          p: { xs: 2.5, sm: 4 },
          border: '1px solid rgba(25, 118, 210, 0.2)',
        }}>
          <Typography 
            id="modal-modal-title" 
            variant="h5" 
            component="h2" 
            sx={{ 
              mb: { xs: 2, sm: 3 },
              fontWeight: 700,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              background: 'linear-gradient(135deg, #1976d2 0%, #00f2fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textAlign: 'center',
              letterSpacing: '0.05em'
            }}
          >
            Create New Listing
          </Typography>
          <Stack spacing={2}>
            <TextField 
              label="Username" 
              value={listingUserName || userEmail} 
              disabled 
              fullWidth 
              helperText="Username is automatically set to your registered email"
            />
            <TextField 
              label="Title" 
              value={listingTitle} 
              onChange={(e) => setListingTitle(e.target.value)} 
              required 
              fullWidth 
            />
            <TextField 
              label="Description" 
              value={listingDescription} 
              onChange={(e) => setListingDescription(e.target.value)} 
              multiline 
              rows={3} 
              required 
              fullWidth 
              placeholder="add product desc or contact info"
            />
            <TextField 
              label="Price" 
              value={listingPrice} 
              onChange={handlePriceChange} 
              required 
              fullWidth 
              inputProps={{ inputMode: 'numeric', pattern: '[0-9.]*' }}
            />
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select value={listingCategory} label="Category" onChange={(e) => setListingCategory(e.target.value)}>
                <MenuItem value="Electronics">Electronics</MenuItem>
                <MenuItem value="Furniture">Furniture</MenuItem>
                <MenuItem value="Clothing">Clothing</MenuItem>
                <MenuItem value="Books">Books</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Condition</InputLabel>
              <Select value={listingCondition} label="Condition" onChange={(e) => setListingCondition(e.target.value)}>
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="Like New">Like New</MenuItem>
                <MenuItem value="Good">Good</MenuItem>
                <MenuItem value="Fair">Fair</MenuItem>
                <MenuItem value="Poor">Poor</MenuItem>
              </Select>
            </FormControl>
            <TextField 
              label="GroupMe Link" 
              value={listingSocialLink} 
              onChange={(e) => setListingSocialLink(e.target.value)} 
              required
              fullWidth 
              placeholder="https://groupme.com/join_group/..."
              helperText="Required: Enter your GroupMe group join link"
            />
            <Button variant="outlined" component="label" required fullWidth sx={{ borderColor: '#1976d2', color: '#1976d2', '&:hover': { borderColor: '#1565c0', backgroundColor: 'rgba(25, 118, 210, 0.04)' } }}>
              {listingImageFile ? `Selected: ${listingImageFile.name}` : 'Upload Picture *'}
              <input type="file" hidden accept="image/*" onChange={handleImageSelect} required />
            </Button>
            {listingImagePreview && (
              <Box sx={{ width: '100%', maxHeight: '200px', overflow: 'hidden', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                <img 
                  src={listingImagePreview} 
                  alt="Preview" 
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </Box>
            )}
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <Button disabled={submitLoading} onClick={handleSubmit} variant="contained" fullWidth sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}>{submitLoading ? 'Submitting…' : 'Submit'}</Button>
          </Stack>
        </Box>
      </Modal>

      <Modal 
        open={detailsOpen} 
        onClose={handleDetailsClose} 
        aria-labelledby="details-modal-title" 
        aria-describedby="details-modal-description"
        sx={{
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          width: { xs: '95%', sm: '90%', md: 650 }, 
          maxWidth: '95vw',
          maxHeight: '90vh', 
          overflowY: 'auto',
          bgcolor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: { xs: '16px', sm: '24px' }, 
          boxShadow: '0 20px 60px rgba(25, 118, 210, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5)',
          p: { xs: 2.5, sm: 4 },
          border: '1px solid rgba(25, 118, 210, 0.2)',
        }}>
          {selectedListing && (
            <>
              <Typography 
                id="details-modal-title" 
                variant="h4" 
                component="h2" 
                sx={{ 
                  mb: { xs: 2, sm: 3 },
                  fontWeight: 700,
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                  background: 'linear-gradient(135deg, #1976d2 0%, #00f2fe 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '0.02em',
                  textTransform: 'capitalize'
                }}
              >
                {selectedListing.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ width: '100%', height: { xs: '200px', sm: '300px' }, position: 'relative' }}>
                  {selectedListing.imageUrl && (<img src={selectedListing.imageUrl} alt={selectedListing.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />)}
                </Box>
                <Stack spacing={2}>
                  {session ? (
                    <>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Description</Typography>
                    <Typography variant="body1">{selectedListing.description}</Typography>
                  </Box>
                      {selectedListing.userId !== userId && (
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {selectedListing.groupMeLink && (
                            <Button
                              variant="outlined"
                              href={selectedListing.groupMeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                backgroundColor: '#00AFF0',
                                color: '#fff',
                                borderColor: '#00AFF0',
                                fontWeight: 600,
                                borderRadius: '12px',
                                px: { xs: 2, sm: 3 },
                                py: { xs: 1.2, sm: 1.5 },
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                '&:hover': {
                                  backgroundColor: '#0099d6',
                                  borderColor: '#0099d6',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 4px 12px rgba(0, 175, 240, 0.4)',
                                }
                              }}
                            >
                              Contact via GroupMe
                            </Button>
                          )}
                          <Button
                            variant="contained"
                            onClick={handleContactSeller}
                            sx={{
                              backgroundColor: '#1976d2',
                              color: '#fff',
                              fontWeight: 600,
                              borderRadius: '12px',
                              px: { xs: 2, sm: 3 },
                              py: { xs: 1.2, sm: 1.5 },
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              '&:hover': {
                                backgroundColor: '#1565c0',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                              }
                            }}
                          >
                            Contact via Email
                          </Button>
                  </Box>
                  )}
                    </>
                  ) : (
                    <Box sx={{ 
                      p: 3, 
                      backgroundColor: 'rgba(25, 118, 210, 0.05)', 
                      borderRadius: '12px',
                      border: '1px solid rgba(25, 118, 210, 0.2)'
                    }}>
                      <Typography variant="body1" sx={{ color: '#1976d2', fontWeight: 600, mb: 1 }}>
                        Login to Contact or Sell
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Please log in to view the description and contact the seller.
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    gap: { xs: 1.5, sm: 0 }
                  }}>
                    <Box><Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Price</Typography><Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{formatPrice(selectedListing.price)}</Typography></Box>
                    <Box><Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Condition</Typography><Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{selectedListing.condition}</Typography></Box>
                    <Box><Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Category</Typography><Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{selectedListing.category}</Typography></Box>
                  </Box>
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Contact Seller Message Modal */}
      <Modal
        open={contactMessageOpen}
        onClose={() => {
          setContactMessageOpen(false);
          setContactMessage('');
        }}
        aria-labelledby="contact-modal-title"
        aria-describedby="contact-modal-description"
        sx={{
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: '90%', md: 500 },
          maxWidth: '95vw',
          bgcolor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: { xs: '16px', sm: '24px' },
          boxShadow: '0 20px 60px rgba(25, 118, 210, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5)',
          p: { xs: 2.5, sm: 4 },
          border: '1px solid rgba(25, 118, 210, 0.2)',
        }}>
          <Typography
            id="contact-modal-title"
            variant="h5"
            component="h2"
            sx={{
              mb: { xs: 2, sm: 3 },
              fontWeight: 700,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              background: 'linear-gradient(135deg, #1976d2 0%, #00f2fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textAlign: 'center',
              letterSpacing: '0.05em'
            }}
          >
            Contact Seller
          </Typography>
          <Stack spacing={2}>
            {selectedListing && (
              <Box>
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  Sending message about: <strong>{selectedListing.title}</strong>
                </Typography>
              </Box>
            )}
            <TextField
              label="Your Message"
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              multiline
              rows={5}
              required
              fullWidth
              placeholder="Type your message to the seller here..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="outlined"
                onClick={() => {
                  setContactMessageOpen(false);
                  setContactMessage('');
                }}
                sx={{
                  flex: 1,
                  borderRadius: '12px',
                  py: { xs: 1.2, sm: 1.5 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  borderColor: '#999',
                  color: '#666',
                  '&:hover': {
                    borderColor: '#666',
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={sendingEmail || !contactMessage.trim()}
                onClick={handleSendMessage}
                variant="contained"
                sx={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #1976d2 0%, #00f2fe 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  borderRadius: '12px',
                  py: { xs: 1.2, sm: 1.5 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(25, 118, 210, 0.5)',
                  },
                  '&:disabled': {
                    background: '#ccc',
                  }
                }}
              >
                {sendingEmail ? 'Sending...' : 'Send Message'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>

      {/* Filter Section */}
      <Box sx={{ 
        mb: { xs: 2, sm: 3 }, 
        display: 'flex', 
        justifyContent: 'flex-end',
        alignItems: 'center',
        px: 0
      }}>
        <Button
          onClick={handleFilterClick}
          sx={{
            borderRadius: '6px',
            px: { xs: 2, sm: 3 },
            py: { xs: 0.75, sm: 1 },
            fontWeight: 500,
            textTransform: 'none',
            border: '1px solid #E0E0E0',
            color: '#555',
            backgroundColor: (selectedCategory || priceSort !== 'none') ? '#E0E0E0' : '#FFFFFF',
            boxShadow: 'none',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            fontFamily: '"Roboto", "Open Sans", sans-serif',
            '&:hover': {
              backgroundColor: '#F5F5F5',
              borderColor: '#D0D0D0',
              boxShadow: 'none',
            }
          }}
        >
          Filter{((selectedCategory || priceSort !== 'none') ? ' (Active)' : '')}
        </Button>
        
        <Menu
          anchorEl={filterAnchorEl}
          open={filterOpen}
          onClose={handleFilterClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <MenuItem 
            onClick={handleCategoryClick}
            onMouseEnter={(e) => {
              setPriceAnchorEl(null); // Close price menu
              setCategoryAnchorEl(e.currentTarget);
            }}
            onMouseLeave={(e) => {
              // Only close if mouse is not moving to submenu
              const relatedTarget = e.relatedTarget;
              if (!relatedTarget || !relatedTarget.closest('.MuiMenu-list')) {
                setTimeout(() => {
                  if (!categoryOpen || !categoryAnchorEl?.contains(e.relatedTarget)) {
                    // Will be handled by menu's onMouseLeave
                  }
                }, 50);
              }
            }}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <ListItemText primary="Category" />
          </MenuItem>
          <MenuItem 
            onClick={handlePriceClick}
            onMouseEnter={(e) => {
              setCategoryAnchorEl(null); // Close category menu
              setPriceAnchorEl(e.currentTarget);
            }}
            onMouseLeave={(e) => {
              // Only close if mouse is not moving to submenu
              const relatedTarget = e.relatedTarget;
              if (!relatedTarget || !relatedTarget.closest('.MuiMenu-list')) {
                setTimeout(() => {
                  if (!priceOpen || !priceAnchorEl?.contains(e.relatedTarget)) {
                    // Will be handled by menu's onMouseLeave
                  }
                }, 50);
              }
            }}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <ListItemText primary="Price" />
          </MenuItem>
          {(selectedCategory || priceSort !== 'none') && (
            <MenuItem onClick={() => {
              setSelectedCategory('');
              setPriceSort('none');
              handleFilterClose();
            }}>
              <ListItemText primary="Clear Filters" />
            </MenuItem>
          )}
        </Menu>

        <Menu
          anchorEl={categoryAnchorEl}
          open={categoryOpen}
          onClose={handleCategoryClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          MenuListProps={{
            onMouseLeave: (e) => {
              // Close if mouse is not moving to parent menu item
              const relatedTarget = e.relatedTarget;
              if (!relatedTarget || !relatedTarget.closest('.MuiMenuItem-root')) {
                handleCategoryClose();
              }
            },
            onMouseEnter: () => {
              // Keep menu open when hovering over it
            }
          }}
          disableAutoFocusItem
          TransitionProps={{
            timeout: 150,
          }}
          sx={{
            '& .MuiPaper-root': {
              transition: 'opacity 150ms ease-in-out, transform 150ms ease-in-out',
              marginLeft: '4px', // Small gap for smooth transition
            }
          }}
        >
          <MenuItem onClick={() => handleCategorySelect('')}>
            <ListItemText primary="All Categories" />
          </MenuItem>
          <MenuItem onClick={() => handleCategorySelect('Electronics')}>
            <ListItemText primary="Electronics" />
          </MenuItem>
          <MenuItem onClick={() => handleCategorySelect('Furniture')}>
            <ListItemText primary="Furniture" />
          </MenuItem>
          <MenuItem onClick={() => handleCategorySelect('Clothing')}>
            <ListItemText primary="Clothing" />
          </MenuItem>
          <MenuItem onClick={() => handleCategorySelect('Books')}>
            <ListItemText primary="Books" />
          </MenuItem>
          <MenuItem onClick={() => handleCategorySelect('Other')}>
            <ListItemText primary="Other" />
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={priceAnchorEl}
          open={priceOpen}
          onClose={handlePriceClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          MenuListProps={{
            onMouseLeave: (e) => {
              // Close if mouse is not moving to parent menu item
              const relatedTarget = e.relatedTarget;
              if (!relatedTarget || !relatedTarget.closest('.MuiMenuItem-root')) {
                handlePriceClose();
              }
            },
            onMouseEnter: () => {
              // Keep menu open when hovering over it
            }
          }}
          disableAutoFocusItem
          TransitionProps={{
            timeout: 150,
          }}
          sx={{
            '& .MuiPaper-root': {
              transition: 'opacity 150ms ease-in-out, transform 150ms ease-in-out',
              marginLeft: '4px', // Small gap for smooth transition
            }
          }}
        >
          <MenuItem onClick={() => handlePriceSort('high')}>
            <ListItemText primary="High to Low" />
          </MenuItem>
          <MenuItem onClick={() => handlePriceSort('low')}>
            <ListItemText primary="Low to High" />
          </MenuItem>
        </Menu>
      </Box>

      {/* Listings Grid - Depop Style */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)', 
            lg: 'repeat(4, 1fr)' 
          },
          gap: { xs: 3, sm: 2.5, md: 3 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        {filteredListings.map((listing) => (
          <Box 
            key={listing.id} 
            onClick={() => handleDetailsOpen(listing)} 
            sx={{ 
              cursor: 'pointer',
              position: 'relative',
              '&:hover': { 
                '& .listing-image': {
                  opacity: 0.9,
                },
                '& .listing-card': {
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }
              }
            }}
          >
            {/* Product Image */}
            <Box 
              className="listing-card"
              sx={{ 
              position: 'relative', 
              overflow: 'hidden',
                width: '100%',
                aspectRatio: '1',
                borderRadius: '8px',
                backgroundColor: '#F5F5F5',
                mb: 1,
                transition: 'all 0.2s ease',
              }}
            >
              {listing.imageUrl ? (
                <img 
                  src={listing.imageUrl} 
                  alt={listing.title} 
                  className="listing-image"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transition: 'opacity 0.2s ease',
                  }} 
                />
              ) : (
                <Box sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F5F5F5',
                  color: '#999',
                  fontSize: '2rem'
                }}>
                  📦
                </Box>
              )}
              {shouldShowDeleteButton(listing) && (
                <Button 
                  variant="contained"
                  color="error" 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleDelete(listing.id);
                  }} 
                  sx={{ 
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    minWidth: 'auto',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(244, 67, 54, 0.9)',
                    color: '#fff',
                    padding: 0,
                    '&:hover': {
                      backgroundColor: '#f44336',
                    }
                  }}
                >
                  ×
                </Button>
              )}
            </Box>
            
            {/* Price - Depop Style */}
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: '"Roboto", "Open Sans", sans-serif',
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                color: '#333',
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              {formatPrice(listing.price)}
            </Typography>
          </Box>
        ))}
      </Box>
      </Box>
      
    </Box>
  )
}


