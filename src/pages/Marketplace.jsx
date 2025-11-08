import { Box, Button, Stack, Typography, Modal, TextField, FormControl, InputLabel, Select, MenuItem, Link, Alert } from '@mui/material';
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient';
import { createListing } from '../api/gus';

export default function Marketplace() {
  const [listings, setListings] = useState([])
  const [session, setSession] = useState(null)
  const [accessToken, setAccessToken] = useState('')

  const [listingTitle, setListingTitle] = useState("")
  const [listingDescription, setListingDescription] = useState("")
  const [listingImageFile, setListingImageFile] = useState(null)
  const [listingImagePreview, setListingImagePreview] = useState(null)
  const [listingPrice, setListingPrice] = useState("")
  const [listingCondition, setListingCondition] = useState("")
  const [listingGroupMeLink, setListingGroupMeLink] = useState("")
  const [listingCategory, setListingCategory] = useState("")
  const [listingUserName, setListingUserName] = useState("")
  const [selectedListing, setSelectedListing] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    // Clean up image preview URL when closing modal
    if (listingImagePreview) {
      URL.revokeObjectURL(listingImagePreview);
      setListingImagePreview(null);
    }
    setOpen(false);
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
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setAccessToken(s?.access_token ?? '')
    })
    return () => { sub.subscription.unsubscribe() }
  },[]);

  const handleSubmit = async () => {
    if (!accessToken) { alert('Please log in to create a listing.'); return; }
    try {
      setSubmitLoading(true);
      setSubmitError('');
      await createListing(accessToken, {
        userName: listingUserName,
        category: listingCategory,
        title: listingTitle,
        description: listingDescription,
        price: listingPrice,
        condition: listingCondition,
        groupMeLink: listingGroupMeLink
      }, listingImageFile);
      // Clean up image preview URL
      if (listingImagePreview) {
        URL.revokeObjectURL(listingImagePreview);
      }
      setListingUserName(""); setListingCategory(""); setListingTitle(""); setListingDescription(""); setListingImageFile(null); setListingImagePreview(null); setListingPrice(""); setListingCondition(""); setListingGroupMeLink("");
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
    if (file) {
      // Revoke previous object URL if it exists
      if (listingImagePreview) {
        URL.revokeObjectURL(listingImagePreview);
      }
      setListingImageFile(file);
      setListingImagePreview(URL.createObjectURL(file));
    }
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

  return (
    <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh', py: 4 }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h3" sx={{ fontWeight: 300, color: '#2c2c2c', textAlign: 'center', mb: 1, letterSpacing: '-0.02em' }}>Gus Marketplace</Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, color: '#666', textAlign: 'center', mb: 5 }}>Listings</Typography>
          <Button variant="contained" onClick={handleOpen} sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}>Add a Listing</Button>
        </Stack>
      </Box>

      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4 }}>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>Add New Listing</Typography>
          <Stack spacing={2}>
            <TextField label="Username" value={listingUserName} onChange={(e) => setListingUserName(e.target.value)} fullWidth />
            <TextField label="Title" value={listingTitle} onChange={(e) => setListingTitle(e.target.value)} fullWidth />
            <TextField label="Description" value={listingDescription} onChange={(e) => setListingDescription(e.target.value)} multiline rows={3} fullWidth />
            <TextField label="Price" value={listingPrice} onChange={(e) => setListingPrice(e.target.value)} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={listingCategory} label="Category" onChange={(e) => setListingCategory(e.target.value)}>
                <MenuItem value="Electronics">Electronics</MenuItem>
                <MenuItem value="Furniture">Furniture</MenuItem>
                <MenuItem value="Clothing">Clothing</MenuItem>
                <MenuItem value="Books">Books</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Condition</InputLabel>
              <Select value={listingCondition} label="Condition" onChange={(e) => setListingCondition(e.target.value)}>
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="Like New">Like New</MenuItem>
                <MenuItem value="Good">Good</MenuItem>
                <MenuItem value="Fair">Fair</MenuItem>
                <MenuItem value="Poor">Poor</MenuItem>
              </Select>
            </FormControl>
            <TextField label="GroupMe Link" value={listingGroupMeLink} onChange={(e) => setListingGroupMeLink(e.target.value)} fullWidth />
            <Button variant="outlined" component="label" fullWidth sx={{ borderColor: '#1976d2', color: '#1976d2', '&:hover': { borderColor: '#1565c0', backgroundColor: 'rgba(25, 118, 210, 0.04)' } }}>
              {listingImageFile ? `Selected: ${listingImageFile.name}` : 'Select Image'}
              <input type="file" hidden accept="image/*" onChange={handleImageSelect} />
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

      <Modal open={detailsOpen} onClose={handleDetailsClose} aria-labelledby="details-modal-title" aria-describedby="details-modal-description">
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, maxHeight: '90vh', overflowY: 'auto', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4 }}>
          {selectedListing && (
            <>
              <Typography id="details-modal-title" variant="h5" component="h2" sx={{ mb: 2 }}>{selectedListing.title}</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ width: '100%', height: '300px', position: 'relative' }}>
                  {selectedListing.imageUrl && (<img src={selectedListing.imageUrl} alt={selectedListing.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />)}
                </Box>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Description</Typography>
                    <Typography variant="body1">{selectedListing.description}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box><Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Price</Typography><Typography variant="body1">{selectedListing.price}</Typography></Box>
                    <Box><Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Condition</Typography><Typography variant="body1">{selectedListing.condition}</Typography></Box>
                    <Box><Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Category</Typography><Typography variant="body1">{selectedListing.category}</Typography></Box>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Contact Seller</Typography>
                    <Link href={selectedListing.groupMeLink} target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-block', mt: 1, color: '#1976d2', '&:hover': { textDecoration: 'underline' } }}>Open GroupMe Chat</Link>
                  </Box>
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      <Stack direction="row" flexWrap="wrap" gap={3} justifyContent="center">
        {listings.map((listing) => (
          <Box key={listing.id} onClick={() => handleDetailsOpen(listing)} sx={{ width: '350px', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } }}>
            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
              {listing.imageUrl && (<img src={listing.imageUrl} alt={listing.title} style={{ width: '100%', height: '200px', objectFit: 'cover', objectPosition: 'center', transition: 'transform 0.3s ease' }} />)}
            </Box>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: '#1a1a1a', mb: 1, fontSize: '1.1rem', lineHeight: 1.3 }}>{listing.title}</Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 2, lineHeight: 1.5, fontSize: '0.9rem' }}>{listing.description}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c', fontSize: '1.2rem' }}>{listing.price}</Typography>
                <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4CAF50' }} />
              </Box>
              {session && (
                <Button variant="text" color="error" onClick={(e)=>{e.stopPropagation(); handleDelete(listing.id)}} sx={{ mt: 1 }}>Delete (owner only)</Button>
              )}
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}


