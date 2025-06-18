import { Box, Button, Stack, Typography, Modal, TextField, FormControl, InputLabel, Select, MenuItem, Link } from '@mui/material';
import { useEffect, useState } from 'react'


function App() {
 /*  private String userName;
  private String title;
  private String description;
  private String category;
  private String imageUrl;
  private String price;
  private String condition;
  private String groupMeLink; */

  const [listings, setListings] = useState([])
  const [listingTitle, setListingTitle] = useState("")
  const [listingDescription, setListingDescription] = useState("")
  const [listingImageUrl, setListingImageUrl] = useState("")
  const [listingPrice, setListingPrice] = useState("")
  const [listingCondition, setListingCondition] = useState("")
  const [listingGroupMeLink, setListingGroupMeLink] = useState("")
  const [listingCategory, setListingCategory] = useState("")
  const [listingUserName, setListingUserName] = useState("") 
  const [selectedListing, setSelectedListing] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [open, setOpen] = useState(false);

 

  
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleListingDisplay = async () => {
    console.log("Starting to fetch listings...");
    try{
      const response = await fetch(
        "http://localhost:8082/api/v1/gus",
        {
          method: "GET",
          headers:{
            "Content-Type": "application/json",
          }
        }
      );
      
      console.log("Response received:", response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Raw listing data:", data);
      setListings(data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  }

  useEffect(() =>{
    console.log("Component mounted, fetching listings...");
    handleListingDisplay();
  },[]);

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:8082/api/v1/gus/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: listingUserName,
          category: listingCategory,
          title: listingTitle,
          description: listingDescription,
          imgUrl: listingImageUrl,
          price: listingPrice,
          condition: listingCondition,
          groupMeLink: listingGroupMeLink
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Reset form and close modal
      setListingUserName("");
      setListingCategory("");
      setListingTitle("");
      setListingDescription("");
      setListingImageUrl("");
      setListingPrice("");
      setListingCondition("");
      setListingGroupMeLink("");
      handleClose();
      
      // Refresh listings
      handleListingDisplay();
    } catch (error) {
      console.error("Error creating listing:", error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // 1. Get pre-signed URL
      const res = await fetch('http://localhost:8082/api/v1/gus/getUploadUrl');
      if (!res.ok) {
        throw new Error(`Failed to get upload URL: ${res.status}`);
      }
      const { uploadUrl, fileUrl } = await res.json();
    
      // 2. Upload file to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/jpeg',
        },
        body: file
      });

      if (!uploadRes.ok) {
        throw new Error(`Failed to upload file: ${uploadRes.status}`);
      }

      setListingImageUrl(fileUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleDetailsOpen = (listing) => {
    console.log("Opening details for listing:", listing);
    setSelectedListing(listing);
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedListing(null);
  };

  return (
    <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh', py: 4 }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 300,
              color: '#2c2c2c',
              textAlign: 'center',
              mb: 1,
              letterSpacing: '-0.02em'
            }}
          >
            Gus Marketplace
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 400,
              color: '#666',
              textAlign: 'center',
              mb: 5
            }}
          >
            Listings
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleOpen}
            sx={{ 
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            Add a Listing
          </Button>
        </Stack>
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            Add New Listing
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Username"
              value={listingUserName}
              onChange={(e) => setListingUserName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Title"
              value={listingTitle}
              onChange={(e) => setListingTitle(e.target.value)}
              fullWidth
            />
            <TextField
              label="Description"
              value={listingDescription}
              onChange={(e) => setListingDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Price"
              value={listingPrice}
              onChange={(e) => setListingPrice(e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={listingCategory}
                label="Category"
                onChange={(e) => setListingCategory(e.target.value)}
              >
                <MenuItem value="Electronics">Electronics</MenuItem>
                <MenuItem value="Furniture">Furniture</MenuItem>
                <MenuItem value="Clothing">Clothing</MenuItem>
                <MenuItem value="Books">Books</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Condition</InputLabel>
              <Select
                value={listingCondition}
                label="Condition"
                onChange={(e) => setListingCondition(e.target.value)}
              >
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="Like New">Like New</MenuItem>
                <MenuItem value="Good">Good</MenuItem>
                <MenuItem value="Fair">Fair</MenuItem>
                <MenuItem value="Poor">Poor</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="GroupMe Link"
              value={listingGroupMeLink}
              onChange={(e) => setListingGroupMeLink(e.target.value)}
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <Button 
                variant="contained" 
                component="label"
                sx={{ 
                  flex: 1,
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  }
                }}
              >
                Upload Picture
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
              <Button 
                onClick={handleSubmit}
                variant="contained" 
                sx={{ 
                  flex: 1,
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  }
                }}
              >
                Submit
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>

      {/* Listing Details Modal */}
      <Modal
        open={detailsOpen}
        onClose={handleDetailsClose}
        aria-labelledby="details-modal-title"
        aria-describedby="details-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          maxHeight: '90vh',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          {selectedListing && (
            <>
              <Typography id="details-modal-title" variant="h5" component="h2" sx={{ mb: 2 }}>
                {selectedListing.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ width: '100%', height: '300px', position: 'relative' }}>
                  {selectedListing.imageUrl && (
                    <img 
                      src={selectedListing.imageUrl}
                      alt={selectedListing.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  )}
                </Box>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Description</Typography>
                    <Typography variant="body1">{selectedListing.description}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Price</Typography>
                      <Typography variant="body1">{selectedListing.price}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Condition</Typography>
                      <Typography variant="body1">{selectedListing.condition}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Category</Typography>
                      <Typography variant="body1">{selectedListing.category}</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Contact Seller</Typography>
                    <Link 
                      href={selectedListing.groupMeLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ 
                        display: 'inline-block',
                        mt: 1,
                        color: '#1976d2',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      Open GroupMe Chat
                    </Link>
                  </Box>
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      <Stack 
        direction="row"
        flexWrap="wrap"
        gap={3}
        justifyContent="center"
      >
        {listings.map((listing) => {
          /*console.log("Rendering listing:", listing);*/
          return (
            <Box
              key={listing.id}
              onClick={() => handleDetailsOpen(listing)}
              sx={{
                width: '350px',
                backgroundColor: '#fff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                }
              }}
            >
              <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                {listing.imageUrl && (
                  <img 
                    src={listing.imageUrl}
                    alt={listing.title}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                )}
              </Box>
              
              <Box sx={{ p: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 500,
                    color: '#1a1a1a',
                    mb: 1,
                    fontSize: '1.1rem',
                    lineHeight: 1.3
                  }}
                >
                  {listing.title}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#666',
                    mb: 2,
                    lineHeight: 1.5,
                    fontSize: '0.9rem'
                  }}
                >
                  {listing.description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#2c2c2c',
                      fontSize: '1.2rem'
                    }}
                  >
                    {listing.price}
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: '#4CAF50' 
                    }} 
                  />
                </Box>
              </Box>
            </Box>
          );
        })}
      </Stack>
   
    </Box>
  )
}

export default App

